import { Connection, PublicKey } from "@solana/web3.js";

export interface TokenHolder {
  address: string;
  balance: string;
  uiAmount: number;
}

/**
 * 특정 토큰 mint 주소를 보유한 상위 홀더를 조회합니다
 * getTokenLargestAccounts를 사용하여 빠르게 상위 20개 계정을 조회합니다
 */
export async function getTokenHolders(
  connection: Connection,
  mintAddress: string,
  limit: number = 20
): Promise<TokenHolder[]> {
  try {
    // 토큰 주소 유효성 검증
    let mintPublicKey: PublicKey;
    try {
      mintPublicKey = new PublicKey(mintAddress);
    } catch {
      throw new Error(
        `유효하지 않은 토큰 주소입니다: ${mintAddress}\n` +
          `참고: pump.fun 주소가 아닌 실제 SPL 토큰 mint 주소를 사용해야 합니다.`
      );
    }

    // 토큰 존재 여부 확인
    try {
      const mintInfo = await connection.getParsedAccountInfo(mintPublicKey);
      if (!mintInfo.value) {
        throw new Error(`토큰이 존재하지 않습니다: ${mintAddress}`);
      }
    } catch (err) {
      if (err instanceof Error) {
        throw err;
      }
      throw new Error(
        `토큰 정보를 가져올 수 없습니다. RPC 연결을 확인하세요: ${mintAddress}`
      );
    }

    // getTokenLargestAccounts를 사용하여 상위 계정 조회 (최대 20개, 훨씬 빠름)
    let largestAccounts;
    try {
      largestAccounts = await connection.getTokenLargestAccounts(
        mintPublicKey,
        "confirmed"
      );
    } catch (err) {
      console.error("getTokenLargestAccounts error:", err);

      // 403 에러인 경우 특별한 메시지 표시
      const errorMessage = err instanceof Error ? err.message : String(err);
      if (errorMessage.includes("403") || errorMessage.includes("forbidden")) {
        throw new Error(
          `RPC 접근이 거부되었습니다 (403). 무료 RPC는 제한이 있을 수 있습니다.\n` +
            `해결 방법:\n` +
            `1. Helius, QuickNode 등 더 안정적인 RPC 사용\n` +
            `2. 환경 변수 NEXT_PUBLIC_RPC_URL을 업데이트하세요\n` +
            `현재 RPC: ${connection.rpcEndpoint}`
        );
      }

      throw new Error(
        `토큰 홀더 정보를 조회하는데 실패했습니다.\n` +
          `에러: ${errorMessage}\n` +
          `RPC 연결을 확인하세요: ${connection.rpcEndpoint}`
      );
    }

    if (!largestAccounts.value || largestAccounts.value.length === 0) {
      console.warn("No token holders found for mint:", mintAddress);
      return [];
    }

    // 토큰 정보 가져오기 (decimals 확인용)
    let decimals = 6; // 기본값
    try {
      const mintInfo = await connection.getParsedAccountInfo(mintPublicKey);
      if (mintInfo.value && "parsed" in mintInfo.value.data) {
        const parsedData = mintInfo.value.data as {
          parsed: { info: { decimals: number } };
        };
        decimals = parsedData.parsed.info.decimals;
      }
    } catch (err) {
      console.warn("Failed to get mint info, using default decimals:", err);
    }

    // 계정 정보를 병렬로 가져오기
    const accountPromises = largestAccounts.value
      .slice(0, Math.min(limit, 20)) // 최대 20개까지만
      .map(async (account) => {
        try {
          const accountInfo = await connection.getParsedAccountInfo(
            new PublicKey(account.address)
          );
          if (accountInfo.value && "parsed" in accountInfo.value.data) {
            const parsed = accountInfo.value.data as {
              parsed: { info: { owner: string } };
            };
            const owner = parsed.parsed.info.owner;
            const balance = BigInt(account.amount);
            const uiAmount = Number(balance) / Math.pow(10, decimals);

            return {
              address: owner,
              balance: account.amount,
              uiAmount: uiAmount,
            };
          }
        } catch (err) {
          console.warn(
            `Failed to get account info for ${account.address}:`,
            err
          );
        }
        return null;
      });

    const holders = (await Promise.all(accountPromises)).filter(
      (holder): holder is TokenHolder => holder !== null
    );

    return holders;
  } catch (error) {
    console.error("Error fetching token holders:", error);
    // 에러 메시지를 더 명확하게 전달
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`토큰 홀더 조회 중 오류가 발생했습니다: ${String(error)}`);
  }
}

/**
 * 특정 지갑 주소의 토큰 잔액을 조회합니다
 */
export async function getTokenBalance(
  connection: Connection,
  mintAddress: string,
  walletAddress: string
): Promise<number> {
  try {
    const { getAssociatedTokenAddress } = await import("@solana/spl-token");
    const mintPublicKey = new PublicKey(mintAddress);
    const walletPublicKey = new PublicKey(walletAddress);

    const ata = await getAssociatedTokenAddress(mintPublicKey, walletPublicKey);
    const accountInfo = await connection.getTokenAccountBalance(ata);

    return accountInfo.value.uiAmount || 0;
  } catch {
    // ATA가 존재하지 않으면 잔액은 0
    return 0;
  }
}
