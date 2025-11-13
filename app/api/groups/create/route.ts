import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { name } = await request.json()

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "Group name is required" },
        { status: 400 }
      )
    }

    // Create group with settings and add creator as commissioner
    const group = await prisma.group.create({
      data: {
        name: name.trim(),
        members: {
          create: {
            userId: session.user.id,
            role: "COMMISSIONER",
            rotationOrder: 0,
          },
        },
        settings: {
          create: {
            announcementDay: "MONDAY",
            movieDuration: "WEEKLY",
            currentPickerIndex: 0,
            selectionWindowDays: 3,
          },
        },
      },
    })

    return NextResponse.json({ groupId: group.id }, { status: 201 })
  } catch (error) {
    console.error("Group creation error:", error)
    return NextResponse.json(
      { error: "An error occurred while creating the group" },
      { status: 500 }
    )
  }
}
