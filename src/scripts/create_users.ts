import { firebaseAuth } from '../config/firebase';

async function createOrUpdateUser(email: string, password: string, role: string) {
    try {
        let user;
        try {
            user = await firebaseAuth.getUserByEmail(email);
            console.log(`User ${email} already exists. Updating password and claims...`);
            await firebaseAuth.updateUser(user.uid, { password });
        } catch (e: any) {
            if (e.code === 'auth/user-not-found') {
                console.log(`Creating user ${email}...`);
                user = await firebaseAuth.createUser({
                    email,
                    password,
                    displayName: role.charAt(0).toUpperCase() + role.slice(1)
                });
            } else {
                throw e;
            }
        }

        await firebaseAuth.setCustomUserClaims(user.uid, { role, [role]: true });
        console.log(`Successfully configured ${email} with role: ${role}`);
    } catch (error) {
        console.error(`Failed to configure ${email}:`, error);
    }
}

async function main() {
    await createOrUpdateUser('admin@mechhub.local', 'password123', 'admin');
    await createOrUpdateUser('dispatcher@mechhub.local', 'password123', 'dispatcher');
    await createOrUpdateUser('mechanic@mechhub.local', 'password123', 'mechanic');
    process.exit(0);
}

main();
