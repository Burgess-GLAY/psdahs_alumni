const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { autoAssignClassGroup, joinClassGroup, leaveClassGroup } = require('../classGroupService');
const User = require('../../models/User');
const ClassGroup = require('../../models/ClassGroup');

let mongoServer;

// Setup in-memory MongoDB for testing
beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

// Clear database between tests
afterEach(async () => {
    await User.deleteMany({});
    await ClassGroup.deleteMany({});
});

describe('autoAssignClassGroup', () => {
    let testUser;
    let testClassGroup;

    beforeEach(async () => {
        // Create a test class group
        testClassGroup = await ClassGroup.create({
            name: 'Class of 2019/20',
            description: 'Test class group',
            graduationYear: 2020,
            admins: [],
            members: [],
            memberCount: 0,
            isPublic: true
        });

        // Create a test user
        testUser = await User.create({
            firstName: 'Test',
            lastName: 'User',
            email: 'test@example.com',
            password: 'TestPassword123!',
            graduationYear: 2020,
            authMethod: 'local',
            classGroups: []
        });
    });

    test('should successfully assign user to class group for valid graduation year', async () => {
        const result = await autoAssignClassGroup({
            userId: testUser._id,
            graduationYear: 2020,
            userInfo: {
                firstName: testUser.firstName,
                lastName: testUser.lastName,
                email: testUser.email
            }
        });

        expect(result.success).toBe(true);
        expect(result.assignedGroup).toBeDefined();
        expect(result.assignedGroup.name).toBe('Class of 2019/20');
        expect(result.assignedGroup.graduationYear).toBe(2020);
        expect(result.assignedGroup.memberCount).toBe(1);
    });

    test('should update user classGroups array correctly', async () => {
        await autoAssignClassGroup({
            userId: testUser._id,
            graduationYear: 2020,
            userInfo: {
                firstName: testUser.firstName,
                lastName: testUser.lastName,
                email: testUser.email
            }
        });

        const updatedUser = await User.findById(testUser._id);
        expect(updatedUser.classGroups).toHaveLength(1);
        expect(updatedUser.classGroups[0].group.toString()).toBe(testClassGroup._id.toString());
        expect(updatedUser.classGroups[0].isActive).toBe(true);
        expect(updatedUser.classGroups[0].isAdmin).toBe(false);
        expect(updatedUser.classGroups[0].isModerator).toBe(false);
    });

    test('should update class group members array correctly', async () => {
        await autoAssignClassGroup({
            userId: testUser._id,
            graduationYear: 2020,
            userInfo: {
                firstName: testUser.firstName,
                lastName: testUser.lastName,
                email: testUser.email
            }
        });

        const updatedClassGroup = await ClassGroup.findById(testClassGroup._id);
        expect(updatedClassGroup.members).toHaveLength(1);
        expect(updatedClassGroup.members[0].user.toString()).toBe(testUser._id.toString());
        expect(updatedClassGroup.members[0].isActive).toBe(true);
        expect(updatedClassGroup.members[0].role).toBe('member');
    });

    test('should increment memberCount atomically', async () => {
        await autoAssignClassGroup({
            userId: testUser._id,
            graduationYear: 2020,
            userInfo: {
                firstName: testUser.firstName,
                lastName: testUser.lastName,
                email: testUser.email
            }
        });

        const updatedClassGroup = await ClassGroup.findById(testClassGroup._id);
        expect(updatedClassGroup.memberCount).toBe(1);
    });

    test('should handle invalid graduation year (too low)', async () => {
        const result = await autoAssignClassGroup({
            userId: testUser._id,
            graduationYear: 2006,
            userInfo: {
                firstName: testUser.firstName,
                lastName: testUser.lastName,
                email: testUser.email
            }
        });

        expect(result.success).toBe(false);
        expect(result.error).toBe('Graduation year must be between 2007 and 2025');
        expect(result.assignedGroup).toBeNull();
    });

    test('should handle invalid graduation year (too high)', async () => {
        const result = await autoAssignClassGroup({
            userId: testUser._id,
            graduationYear: 2026,
            userInfo: {
                firstName: testUser.firstName,
                lastName: testUser.lastName,
                email: testUser.email
            }
        });

        expect(result.success).toBe(false);
        expect(result.error).toBe('Graduation year must be between 2007 and 2025');
        expect(result.assignedGroup).toBeNull();
    });

    test('should handle missing class group for graduation year', async () => {
        const result = await autoAssignClassGroup({
            userId: testUser._id,
            graduationYear: 2015, // No class group exists for this year
            userInfo: {
                firstName: testUser.firstName,
                lastName: testUser.lastName,
                email: testUser.email
            }
        });

        expect(result.success).toBe(false);
        expect(result.error).toContain('No class group exists for graduation year');
        expect(result.assignedGroup).toBeNull();
    });

    test('should handle duplicate assignment gracefully', async () => {
        // First assignment
        const firstResult = await autoAssignClassGroup({
            userId: testUser._id,
            graduationYear: 2020,
            userInfo: {
                firstName: testUser.firstName,
                lastName: testUser.lastName,
                email: testUser.email
            }
        });

        expect(firstResult.success).toBe(true);

        // Second assignment (duplicate)
        const secondResult = await autoAssignClassGroup({
            userId: testUser._id,
            graduationYear: 2020,
            userInfo: {
                firstName: testUser.firstName,
                lastName: testUser.lastName,
                email: testUser.email
            }
        });

        expect(secondResult.success).toBe(true);
        expect(secondResult.message).toContain('already assigned');

        // Verify memberCount didn't increment twice
        const updatedClassGroup = await ClassGroup.findById(testClassGroup._id);
        expect(updatedClassGroup.memberCount).toBe(1);
        expect(updatedClassGroup.members).toHaveLength(1);
    });

    test('should handle non-existent user', async () => {
        const fakeUserId = new mongoose.Types.ObjectId();

        const result = await autoAssignClassGroup({
            userId: fakeUserId,
            graduationYear: 2020,
            userInfo: {
                firstName: 'Fake',
                lastName: 'User',
                email: 'fake@example.com'
            }
        });

        expect(result.success).toBe(false);
        expect(result.error).toContain('User not found');
    });

    test('should assign multiple users to same class group', async () => {
        const user2 = await User.create({
            firstName: 'Test2',
            lastName: 'User2',
            email: 'test2@example.com',
            password: 'TestPassword123!',
            graduationYear: 2020,
            authMethod: 'local',
            classGroups: []
        });

        // Assign first user
        await autoAssignClassGroup({
            userId: testUser._id,
            graduationYear: 2020,
            userInfo: {
                firstName: testUser.firstName,
                lastName: testUser.lastName,
                email: testUser.email
            }
        });

        // Assign second user
        await autoAssignClassGroup({
            userId: user2._id,
            graduationYear: 2020,
            userInfo: {
                firstName: user2.firstName,
                lastName: user2.lastName,
                email: user2.email
            }
        });

        const updatedClassGroup = await ClassGroup.findById(testClassGroup._id);
        expect(updatedClassGroup.members).toHaveLength(2);
        expect(updatedClassGroup.memberCount).toBe(2);
    });
});

describe('joinClassGroup', () => {
    let testUser;
    let testClassGroup;

    beforeEach(async () => {
        testClassGroup = await ClassGroup.create({
            name: 'Class of 2019/20',
            description: 'Test class group',
            graduationYear: 2020,
            admins: [],
            members: [],
            memberCount: 0,
            isPublic: true
        });

        testUser = await User.create({
            firstName: 'Test',
            lastName: 'User',
            email: 'test@example.com',
            password: 'TestPassword123!',
            graduationYear: 2020,
            authMethod: 'local',
            classGroups: []
        });
    });

    test('should successfully join a class group', async () => {
        const result = await joinClassGroup(testUser._id, testClassGroup._id);

        expect(result.success).toBe(true);
        expect(result.message).toContain('Successfully joined');
        expect(result.classGroup.memberCount).toBe(1);
    });

    test('should prevent duplicate joins', async () => {
        await joinClassGroup(testUser._id, testClassGroup._id);

        const result = await joinClassGroup(testUser._id, testClassGroup._id);

        expect(result.success).toBe(false);
        expect(result.error).toContain('already a member');
        expect(result.code).toBe('ALREADY_MEMBER');
    });

    test('should handle non-existent class group', async () => {
        const fakeGroupId = new mongoose.Types.ObjectId();

        await expect(
            joinClassGroup(testUser._id, fakeGroupId)
        ).rejects.toThrow('Class group not found');
    });
});

describe('leaveClassGroup', () => {
    let testUser;
    let testClassGroup;

    beforeEach(async () => {
        testClassGroup = await ClassGroup.create({
            name: 'Class of 2019/20',
            description: 'Test class group',
            graduationYear: 2020,
            admins: [],
            members: [],
            memberCount: 0,
            isPublic: true
        });

        testUser = await User.create({
            firstName: 'Test',
            lastName: 'User',
            email: 'test@example.com',
            password: 'TestPassword123!',
            graduationYear: 2020,
            authMethod: 'local',
            classGroups: []
        });

        // Join the group first
        await joinClassGroup(testUser._id, testClassGroup._id);
    });

    test('should successfully leave a class group', async () => {
        const result = await leaveClassGroup(testUser._id, testClassGroup._id);

        expect(result.success).toBe(true);
        expect(result.message).toContain('Successfully left');
        expect(result.memberCount).toBe(0);
    });

    test('should decrement memberCount correctly', async () => {
        await leaveClassGroup(testUser._id, testClassGroup._id);

        const updatedClassGroup = await ClassGroup.findById(testClassGroup._id);
        expect(updatedClassGroup.memberCount).toBe(0);
    });

    test('should mark member as inactive', async () => {
        await leaveClassGroup(testUser._id, testClassGroup._id);

        const updatedClassGroup = await ClassGroup.findById(testClassGroup._id);
        const member = updatedClassGroup.members.find(
            m => m.user.toString() === testUser._id.toString()
        );
        expect(member.isActive).toBe(false);
    });

    test('should prevent leaving when not a member', async () => {
        const user2 = await User.create({
            firstName: 'Test2',
            lastName: 'User2',
            email: 'test2@example.com',
            password: 'TestPassword123!',
            graduationYear: 2020,
            authMethod: 'local',
            classGroups: []
        });

        const result = await leaveClassGroup(user2._id, testClassGroup._id);

        expect(result.success).toBe(false);
        expect(result.error).toContain('not a member');
        expect(result.code).toBe('NOT_MEMBER');
    });

    test('should handle non-existent class group', async () => {
        const fakeGroupId = new mongoose.Types.ObjectId();

        await expect(
            leaveClassGroup(testUser._id, fakeGroupId)
        ).rejects.toThrow('Class group not found');
    });
});

describe('Integration tests', () => {
    test('should handle complete join-leave cycle', async () => {
        const classGroup = await ClassGroup.create({
            name: 'Class of 2019/20',
            description: 'Test class group',
            graduationYear: 2020,
            admins: [],
            members: [],
            memberCount: 0,
            isPublic: true
        });

        const user = await User.create({
            firstName: 'Test',
            lastName: 'User',
            email: 'test@example.com',
            password: 'TestPassword123!',
            graduationYear: 2020,
            authMethod: 'local',
            classGroups: []
        });

        // Join
        const joinResult = await joinClassGroup(user._id, classGroup._id);
        expect(joinResult.success).toBe(true);
        expect(joinResult.classGroup.memberCount).toBe(1);

        // Leave
        const leaveResult = await leaveClassGroup(user._id, classGroup._id);
        expect(leaveResult.success).toBe(true);
        expect(leaveResult.memberCount).toBe(0);

        // Verify final state
        const finalClassGroup = await ClassGroup.findById(classGroup._id);
        expect(finalClassGroup.memberCount).toBe(0);
        expect(finalClassGroup.members[0].isActive).toBe(false);
    });

    test('should handle multiple sequential assignments', async () => {
        const classGroup = await ClassGroup.create({
            name: 'Class of 2019/20',
            description: 'Test class group',
            graduationYear: 2020,
            admins: [],
            members: [],
            memberCount: 0,
            isPublic: true
        });

        // Create multiple users
        const users = await Promise.all([
            User.create({
                firstName: 'User1',
                lastName: 'Test',
                email: 'user1@example.com',
                password: 'TestPassword123!',
                graduationYear: 2020,
                authMethod: 'local',
                classGroups: []
            }),
            User.create({
                firstName: 'User2',
                lastName: 'Test',
                email: 'user2@example.com',
                password: 'TestPassword123!',
                graduationYear: 2020,
                authMethod: 'local',
                classGroups: []
            }),
            User.create({
                firstName: 'User3',
                lastName: 'Test',
                email: 'user3@example.com',
                password: 'TestPassword123!',
                graduationYear: 2020,
                authMethod: 'local',
                classGroups: []
            })
        ]);

        // Assign all users sequentially (to avoid race conditions without transactions)
        for (const user of users) {
            const result = await autoAssignClassGroup({
                userId: user._id,
                graduationYear: 2020,
                userInfo: {
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email
                }
            });
            expect(result.success).toBe(true);
        }

        // Verify final member count
        const finalClassGroup = await ClassGroup.findById(classGroup._id);
        expect(finalClassGroup.memberCount).toBe(3);
        expect(finalClassGroup.members).toHaveLength(3);
    });
});
