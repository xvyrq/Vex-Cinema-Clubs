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

    const { joinCode } = await request.json()

    if (!joinCode || !joinCode.trim()) {
      return NextResponse.json(
        { error: "Join code is required" },
        { status: 400 }
      )
    }

    // Find group by join code
    const group = await prisma.group.findUnique({
      where: {
        joinCode: joinCode.trim(),
      },
      include: {
        members: true,
      },
    })

    if (!group) {
      return NextResponse.json(
        { error: "Invalid join code" },
        { status: 404 }
      )
    }

    // Check if user is already a member
    const existingMember = group.members.find(
      (member) => member.userId === session.user.id
    )

    if (existingMember) {
      return NextResponse.json(
        { error: "You are already a member of this group" },
        { status: 400 }
      )
    }

    // Add user to group with next rotation order
    const maxRotationOrder = group.members.reduce(
      (max, member) => Math.max(max, member.rotationOrder),
      -1
    )

    await prisma.groupMember.create({
      data: {
        userId: session.user.id,
        groupId: group.id,
        role: "MEMBER",
        rotationOrder: maxRotationOrder + 1,
      },
    })

    return NextResponse.json({ groupId: group.id }, { status: 200 })
  } catch (error) {
    console.error("Group join error:", error)
    return NextResponse.json(
      { error: "An error occurred while joining the group" },
      { status: 500 }
    )
  }
}
