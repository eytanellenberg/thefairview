import { NextResponse } from "next/server";


export async function GET() {
return NextResponse.json(
{
status: "disabled",
message: "RAI API disabled — demo mode. Live FAIR engine under calibration."
},
{ status: 200 }
);
}
