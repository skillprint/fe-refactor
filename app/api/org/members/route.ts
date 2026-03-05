import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { OrganizationMember } from '@/lib/models/OrganizationMember';
import { User } from '@/lib/models/User';

export async function GET(req: Request) {
    try {
        const cookieStore = await cookies();
        const orgId = cookieStore.get('user_id')?.value; // org_token or user_id stores the org id

        if (!orgId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const members = await OrganizationMember.findAll({
            where: { organization_id: orgId },
            include: [{ model: User, attributes: ['id', 'first_name', 'profile_image'] }],
            order: [['created_at', 'DESC']]
        });

        return NextResponse.json({ success: true, members });
    } catch (error: any) {
        console.error("Fetch Org Members Error:", error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const cookieStore = await cookies();
        const orgId = cookieStore.get('user_id')?.value;

        if (!orgId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { user_id, role = 'member' } = await req.json();

        if (!user_id) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        // Check if user exists
        const user = await User.findByPk(user_id);
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const [member, created] = await OrganizationMember.findOrCreate({
            where: { organization_id: orgId, user_id },
            defaults: { role }
        });

        if (!created) {
            // Update role if already exists
            member.role = role;
            await member.save();
        }

        return NextResponse.json({ success: true, member });
    } catch (error: any) {
        console.error("Add Org Member Error:", error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const cookieStore = await cookies();
        const orgId = cookieStore.get('user_id')?.value;

        if (!orgId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const url = new URL(req.url);
        const user_id = url.searchParams.get('user_id');

        if (!user_id) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        const deleted = await OrganizationMember.destroy({
            where: { organization_id: orgId, user_id }
        });

        return NextResponse.json({ success: true, deleted: deleted > 0 });
    } catch (error: any) {
        console.error("Remove Org Member Error:", error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
