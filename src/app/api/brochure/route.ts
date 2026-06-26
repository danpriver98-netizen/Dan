import { NextResponse } from "next/server";
import { propertyByCode } from "@/lib/mock-data";

/**
 * "Name Bot" — given a property code, package the digital brochure
 * (Tabu deed, municipal tax, floor plan, virtual tour, comparables)
 * ready to be sent over WhatsApp/Facebook.
 *
 * GET /api/brochure?code=BY-PENT-04
 */
export async function GET(req: Request) {
  const code = new URL(req.url).searchParams.get("code");
  if (!code) {
    return NextResponse.json({ error: "Missing ?code=" }, { status: 400 });
  }

  const property = propertyByCode(code);
  if (!property) {
    return NextResponse.json(
      { error: `No property found for code "${code}".` },
      { status: 404 }
    );
  }

  const assets = [
    { type: "tabu_deed", label: "Tabu / Title Deed", available: property.brochure.tabuDeed },
    { type: "municipal_tax", label: "Municipal Tax (Arnona)", available: property.brochure.municipalTax },
    { type: "floor_plan", label: "Floor Plan", available: property.brochure.floorPlan },
    { type: "virtual_tour", label: "Virtual Tour (360°)", available: property.brochure.virtualTour },
    { type: "comparables", label: "Comparable Deals (CMA)", available: property.brochure.comparables },
  ];

  return NextResponse.json({
    property: {
      code: property.code,
      title: property.title,
      address: property.address,
      askingPrice: property.askingPrice,
    },
    assets,
    deliveryChannels: ["whatsapp", "facebook_messenger"],
    packagedAt: new Date().toISOString(),
    // In production this would be a generated, signed PDF URL.
    pdfUrl: `/brochures/${property.code}.pdf`,
  });
}
