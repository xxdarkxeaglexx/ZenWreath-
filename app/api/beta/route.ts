import {env} from 'cloudflare:workers';
import {getChatGPTUser} from '../../chatgpt-auth';
import {handleBeta} from '../../../server/beta';
export const dynamic='force-dynamic';
async function handle(r:Request){return handleBeta(r,await getChatGPTUser(),env.DB!,(env as any).BETA_REPORT_ACCESS_HASH)}
export const GET=handle;export const POST=handle;
