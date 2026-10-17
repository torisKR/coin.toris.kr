import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const require=createRequire(path.join(process.env.PEPEBEAR_QA_TOOLS||'/tmp/pepebear-qa','package.json'));
const {chromium}=require('playwright');
const {default:AxeBuilder}=require('@axe-core/playwright');
const sharp=require('sharp');
const base=process.env.QA_BASE_URL||'http://localhost:3002';
const dir=process.env.QA_OUTPUT||'artifacts/rebuild/local';fs.mkdirSync(dir,{recursive:true});
const result={base,at:new Date().toISOString(),pages:[],checks:{},errors:[]};
const browser=await chromium.launch({channel:'chrome',args:['--enable-webgl','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const delay=(page,ms)=>page.waitForTimeout(ms);
try {
 const context=await browser.newContext({viewport:{width:1440,height:1000},acceptDownloads:true});
 const page=await context.newPage();page.on('pageerror',e=>result.errors.push(e.message));
 const go=async(route)=>{const r=await page.goto(base+route,{waitUntil:'networkidle'});assert.equal(r.status(),200);const decline=page.getByRole('button',{name:'Decline',exact:true});if(await decline.isVisible())await decline.click();};
 for(const route of ['/','/coin/PEBR','/coin/YETI','/coin/XMASR','/studio?coin=YETI','/coin/PEBR/memes?template=coffee','/coin/PEBR/token','/privacy']) {
  await go(route);
  for(const width of [360,390,768,1440]) {
   await page.setViewportSize({width,height:width<768?844:1000});
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${route} overflow ${width}`);
  }
  await page.evaluate(()=>document.querySelectorAll('[data-reveal]').forEach(e=>{e.style.transition='none';e.setAttribute('data-reveal','visible');}));
  const axe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();
  result.pages.push({route,axe:axe.violations.map(v=>({id:v.id,targets:v.nodes.map(n=>n.target)}))});
 }
 for(const [symbol,label,seconds] of [['PEBR','Raise the coffee',2],['YETI','Take the swing',2.4],['XMASR','Start the launch',3]]) {
  await go(`/coin/${symbol}`);const host=page.locator('.coin-world-canvas');await host.locator('canvas').waitFor();await page.locator('.coin-world-canvas.is-ready').waitFor();
  await host.scrollIntoViewIfNeeded();
  await page.getByRole('button',{name:'Pause',exact:true}).click();await delay(page,180);
  const before=await host.screenshot({path:`${dir}/${symbol}-start.png`});await delay(page,350);
  assert.deepEqual(await host.screenshot(),before,`${symbol} paused idle is stationary`);
  await page.getByRole('button',{name:label,exact:true}).click();
  await delay(page,seconds*400);
  const mid=await host.screenshot({path:`${dir}/${symbol}-action.png`});assert.notDeepEqual(mid,before,`${symbol} visibly animates`);
  await page.getByRole('button',{name:'Pause',exact:true}).click();await delay(page,120);
  const frozen=await host.screenshot();await delay(page,350);
  assert.deepEqual(await host.screenshot(),frozen,`${symbol} pause freezes action`);
  await page.getByRole('button',{name:'Play',exact:true}).click();
  await page.getByRole('button',{name:label,exact:true}).waitFor({state:'visible',timeout:15000});
  await page.getByRole('button',{name:'Pause',exact:true}).click();await delay(page,200);
  await host.screenshot({path:`${dir}/${symbol}-end.png`});
  // Drag displacement is cumulative; releasing a drag must not run an action.
  const box=await host.boundingBox();const x=box.x+box.width*.5,y=box.y+box.height*.6;
  await page.mouse.move(x,y);await page.mouse.down();await page.mouse.move(x+90,y,{steps:10});await page.mouse.up();await delay(page,250);
  assert.ok(await page.getByRole('button',{name:label,exact:true}).isEnabled(),`${symbol} drag does not trigger action`);
  await host.focus();await page.keyboard.press('ArrowLeft');await delay(page,250);
  await page.keyboard.press('Enter');await page.getByRole('button',{name:'Playing action',exact:true}).waitFor();
  if(symbol==='XMASR') {
    await delay(page,180);
    await page.evaluate(()=>window.scrollTo(0,document.body.scrollHeight));
    await delay(page,3300);
    await host.scrollIntoViewIfNeeded();
    assert.ok(await page.getByRole('button',{name:'Playing action',exact:true}).isVisible(),'offscreen animation does not advance to completion');
    result.checks.offscreenAnimationSuspended=true;
  }
  result.checks[`${symbol}ActionPauseDragKeyboard`]=true;
 }
 await go('/');
 for(let i=0;i<9;i++) {
  const symbol=['PEBR','YETI','XMASR'][i%3];
  await page.getByRole('tab',{name:new RegExp(`\\$${symbol}`)}).click();
  const frame=page.frameLocator('.world-iframe');await frame.locator('.coin-world-canvas.is-ready').waitFor();
  assert.equal(await page.locator('.world-iframe').count(),1);assert.equal(await frame.locator('canvas').count(),1);
 }
 result.checks.oneSelectedRendererAfterNineSwitches=true;
 await page.evaluate(()=>document.querySelectorAll('[data-reveal]').forEach(e=>{e.style.transition='none';e.setAttribute('data-reveal','visible');}));
 await page.screenshot({path:`${dir}/home-desktop.png`,fullPage:true});
 for(const symbol of ['PEBR','YETI','XMASR']) {
  await go(`/studio?coin=${symbol}`);await page.getByRole('button',{name:'Action',exact:true}).click();
  const pending=page.waitForEvent('download');await page.getByRole('button',{name:/Save 1080 PNG/}).click();
  const download=await pending;await download.saveAs(`${dir}/${symbol}-studio.png`);
  const meta=await sharp(`${dir}/${symbol}-studio.png`).metadata();assert.equal(meta.width,1080);assert.equal(meta.height,1080);
 }
 result.checks.three1080PngExports=true;
 // Mobile loads only the rendered poster until the explicit 3D request.
 const mobile=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
 const touch=await mobile.newPage();const glbs=[];touch.on('request',r=>{if(r.url().endsWith('.glb'))glbs.push(r.url());});
 await touch.goto(base+'/',{waitUntil:'networkidle'});assert.equal(glbs.length,0);
 await touch.getByRole('button',{name:'Open 3D world',exact:true}).click();
 const tf=touch.frameLocator('.world-iframe');await tf.locator('.coin-world-canvas.is-ready').waitFor();assert.equal(glbs.length,1);
 const th=tf.locator('.coin-world-canvas');await th.scrollIntoViewIfNeeded();
 const bounds=await th.boundingBox();const cdp=await mobile.newCDPSession(touch);
 const x=bounds.x+bounds.width*.50,y=bounds.y+bounds.height*.62;
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});
 for(let i=1;i<=6;i++)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x+12*i,y}]});
 await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 assert.ok(await tf.getByRole('button',{name:'Raise the coffee',exact:true}).isEnabled());
 await th.tap();await tf.getByRole('button',{name:'Playing action',exact:true}).waitFor();
 await touch.screenshot({path:`${dir}/home-touch.png`,fullPage:true});
 result.checks.mobilePosterOptInTouchDragAndTap=true;await mobile.close();
 // Failed GLB preserves the very same model poster and all page navigation.
 const fail=await browser.newContext();const fp=await fail.newPage();await fp.route('**/*.glb',r=>r.abort());
 await fp.goto(base+'/coin/YETI',{waitUntil:'networkidle'});await fp.getByText('3D unavailable. Showing poster.',{exact:true}).waitFor();
 assert.ok(await fp.getByRole('button',{name:'Take the swing',exact:true}).isDisabled());
 assert.ok(await fp.locator('.coin-world-poster').evaluate(img=>img.complete&&img.naturalWidth>0));
 assert.equal(await fp.locator('.coin-world-poster').getAttribute('src'),'/worlds/yeti-poster.png');
 result.checks.failedModelPoster=true;await fail.close();
 await go('/coin/PEBR');await page.locator('.coin-world-canvas.is-ready').waitFor();
 await page.locator('.coin-world-canvas canvas').evaluate(canvas=>canvas.getContext('webgl2').getExtension('WEBGL_lose_context').loseContext());
 await page.getByText('3D unavailable. Showing poster.',{exact:true}).waitFor();
 assert.equal(await page.locator('.coin-world-canvas canvas').count(),0);
 result.checks.contextLossDisposesRendererAndShowsPoster=true;

 const reduced=await browser.newContext({reducedMotion:'reduce',viewport:{width:390,height:844}});const rp=await reduced.newPage();
 await rp.goto(base+'/coin/XMASR',{waitUntil:'networkidle'});await rp.locator('.coin-world-canvas.is-ready').waitFor();
 assert.equal(await rp.getByRole('button',{name:'Play',exact:true}).getAttribute('aria-pressed'),'true');
 result.checks.reducedMotionStartsPaused=true;await reduced.close();
 assert.equal(result.errors.length,0,JSON.stringify(result.errors));
 assert.equal(result.pages.flatMap(p=>p.axe).length,0,JSON.stringify(result.pages));
 console.log(JSON.stringify(result,null,2));
} catch(error) {result.failure=String(error);throw error;} finally {
 fs.writeFileSync(`${dir}/qa.json`,JSON.stringify(result,null,2));await browser.close();
}
