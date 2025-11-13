import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(
  request: NextRequest,
  { params }: { params: { groupId: string } }
) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is commissioner
    const membership = await prisma.groupMember.findFirst({
      where: {
        groupId: params.groupId,
        userId: session.user.id,
        role: "COMMISSIONER",
      },
    })

    if (!membership) {
      return NextResponse.json(
        { error: "Only commissioners can update settings" },
        { status: 403 }
      )
    }

    const { announcementDay, movieDuration } = await request.json()

    const settings = await prisma.groupSettings.update({
      where: {
        groupId: params.groupId,
      },
      data: {
        announcementDay,
        movieDuration,
      },
    })

    return NextResponse.json({ settings }, { status: 200 })
  } catch (error) {
    console.error("Settings update error:", error)
    return NextResponse.json(
      { error: "An error occurred while updating settings" },
      { status: 500 }
    )
  }
}
