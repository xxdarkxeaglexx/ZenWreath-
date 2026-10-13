import {env} from 'cloudflare:workers';
import {getChatGPTUser} from '../../chatgpt-auth';
import {handleSupport} from '../../../server/support';
export const dynamic='force-dynamic';export async function POST(r:Request){return handleSupport(r,await getChatGPTUser(),env.DB!)}
