import {NextResponse} from 'next/server';
export async function POST(){return NextResponse.json({error:'Hosted render workers are not configured. Use the offline browser export API.'},{status:501});}
export async function GET(){return NextResponse.json({error:'Hosted render workers are not configured.'},{status:501});}
