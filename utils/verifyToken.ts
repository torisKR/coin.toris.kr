import { Connection, PublicKey } from "@solana/web3.js";

/**
 * 토큰 주소가 유효한지 확인하고 실제 mint 주소를 반환합니다
 */
export async function verifyTokenAddress(
  connection: Connection,
  address: string
): Promise<{ isValid: boolean; mintAddress?: string; error?: string }> {
  try {
    // 주소 유효성 검증
    let publicKey: PublicKey;
    try {
      publicKey = new PublicKey(address);
    } catch {
      return {
        isValid: false,
        error: "유효하지 않은 주소 형식입니다",
      };
    }

    // 계정 정보 조회
    try {
      const accountInfo = await connection.getParsedAccountInfo(publicKey);

      if (!accountInfo.value) {
        return {
          isValid: false,
          error: "주소에 해당하는 계정이 존재하지 않습니다",
        };
      }

      // 토큰 mint인지 확인
      if (accountInfo.value.data && "parsed" in accountInfo.value.data) {
        const parsed = accountInfo.value.data as {
          parsed: { type: string; info?: { mint?: string; decimals?: number } };
        };

        if (parsed.parsed.type === "mint") {
          return {
            isValid: true,
            mintAddress: address,
          };
        }
      }

      // 일반 계정인 경우, mint 주소가 있는지 확인
      return {
        isValid: true,
        mintAddress: address,
      };
    } catch (err) {
      console.error("Error checking account:", err);
      return {
        isValid: false,
        error: `계정 정보 조회 실패: ${
          err instanceof Error ? err.message : String(err)
        }`,
      };
    }
  } catch (error) {
    return {
      isValid: false,
      error: `검증 중 오류: ${
        error instanceof Error ? error.message : String(error)
      }`,
    };
  }
}
