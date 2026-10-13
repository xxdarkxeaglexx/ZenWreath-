 'use strict';
const TERMS_VERSION='2026-10-12',TERMS_KEY='zenwreath-terms-acceptance';
const requestedBeta=typeof location==='undefined'?'':new URLSearchParams(location.search).get('beta');
const betaInvite=['volunteer','dakota'].includes(requestedBeta)?requestedBeta:'';
let betaAccepted=false;
let termsAccepted=false;try{const record=JSON.parse(localStorage.getItem(TERMS_KEY)||'null');termsAccepted=record?.version===TERMS_VERSION&&typeof record.acceptedAt==='string'&&Number.isFinite(Date.parse(record.acceptedAt));betaAccepted=termsAccepted&&record?.betaRole===betaInvite}catch(e){}
const legalGate=$('legalConsent'),legalAgree=$('legalAgree'),legalAccept=$('legalAccept'),betaAgree=$('betaAgree');
$('betaAgreement').hidden=!betaInvite;$('betaNotice').hidden=!betaInvite;
if(betaInvite){$('betaNoticeTitle').textContent=betaInvite==='dakota'?'Dakota’s beta invitation':'Volunteer beta invitation';$('betaNoticeText').textContent=betaInvite==='dakota'?'Dakota is exempt from the unpaid beta requirement. His compensation is handled in a separate agreement with Shane Bradford. This link does not set or promise a payment amount and does not verify the player’s identity.':'You are joining an unfinished beta. Participation is voluntary and unpaid: you receive no money, wages, fees, or share of revenue for playing or providing feedback.';$('betaAgreementText').textContent=betaInvite==='dakota'?'I understand Dakota’s compensation is handled separately; this invitation does not set a payment amount or grant a payment entitlement to anyone who receives the link.':'I understand I am a volunteer beta player and will receive no money for beta participation or feedback.'}
function updateLegalAccept(){legalAccept.disabled=!legalAgree.checked||(!!betaInvite&&!betaAgree.checked)}
function requireTerms(){if(termsAccepted&&(!betaInvite||betaAccepted))return true;paused=true;resetInput();if($('modal').open)$('modal').close();if(!legalGate.open){if(!$('legalDocument').src)$('legalDocument').src='/terms.html';legalAgree.checked=false;betaAgree.checked=false;legalAccept.disabled=true;legalGate.showModal();}return false}
legalAgree.onchange=updateLegalAccept;betaAgree.onchange=updateLegalAccept;
legalAccept.onclick=()=>{if(!legalAgree.checked||(betaInvite&&!betaAgree.checked))return;const record={version:TERMS_VERSION,acceptedAt:new Date().toISOString(),...(betaInvite?{betaRole:betaInvite}:{})};let persisted=true;try{localStorage.setItem(TERMS_KEY,JSON.stringify(record))}catch(e){persisted=false}termsAccepted=true;betaAccepted=!!betaInvite;legalGate.close();welcome();if(typeof routeStartupInvite==='function')routeStartupInvite();if(!persisted)toast('Accepted for this visit. This browser cannot remember your choice.')};
$('legalDecline').onclick=()=>{legalAgree.checked=false;betaAgree.checked=false;legalAccept.disabled=true;$('legalStatus').textContent='You have not accepted. Play stays paused, and your saved quest is unchanged. You can review the terms and accept whenever you are ready.'};
legalGate.addEventListener('cancel',event=>event.preventDefault());
legalGate.addEventListener('close',()=>{if(!termsAccepted||(betaInvite&&!betaAccepted))requireTerms()});
const agreedClose=close;close=function(){if(!requireTerms())return;return agreedClose()};
const agreedNewGame=newGame;newGame=function(){if(!requireTerms())return;return agreedNewGame()};
const agreedTeam=enterTeam;enterTeam=function(...args){if(!requireTerms())return;return agreedTeam(...args)};
const agreedPlay=playNow;playNow=function(...args){if(!requireTerms())return;return agreedPlay(...args)};
function legalMenu(){appDialog('terms','TERMS OF USE','Your permission to play.','Accepted terms: '+(termsAccepted?TERMS_VERSION:'not yet accepted')+'. Sharing official links and gameplay is allowed. Unauthorized copying and redistribution of protected game content is prohibited.',[['Back',mainMenu,true],['Withdraw acceptance',()=>{termsAccepted=false;try{localStorage.removeItem(TERMS_KEY)}catch(e){}requireTerms()}]],'<p><a class="legalLink" href="/terms.html" target="_blank" rel="noopener">Read the complete Terms of Use ↗</a></p>')}
const agreedMenu=mainMenu;mainMenu=function(){agreedMenu();const b=document.createElement('button');b.textContent='Terms of Use';b.onclick=legalMenu;$('buttons').append(b)};$('menu').onclick=mainMenu;menu=mainMenu;moreHome=mainMenu;
const termsLink=document.createElement('a');termsLink.href='/terms.html';termsLink.target='_blank';termsLink.rel='noopener';termsLink.textContent='Terms of Use';document.querySelector('footer').append(termsLink);

// Cover every gameplay resume path, including later menu modules.
const legalResume=returnToGame;returnToGame=function(...args){if(!requireTerms())return;return legalResume(...args)};
