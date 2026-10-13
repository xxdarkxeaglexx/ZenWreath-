'use strict';
// Always show the running client build, including when playing from an offline cache.
const versionSettings=calmSettings;
calmSettings=function(){
 versionSettings();
 const release=document.createElement('section');
 release.className='calmBanner';
 const copy=document.createElement('div');
 const label=document.createElement('strong');
 label.textContent='ZenWreath · '+GAME_VERSION;
 const hint=document.createElement('small');
 hint.textContent='Include this version when reporting a bug.';
 copy.append(label,hint);release.append(copy);$('extra').prepend(release);
};
