import { Sequelize, DataTypes, QueryInterface } from 'sequelize';
import { randomUUID } from 'crypto';

export const up = async ({ context: sequelize }: { context: Sequelize }) => {
    const queryInterface = sequelize.getQueryInterface();
    const transaction = await sequelize.transaction();

    try {
        // 1. Alter organization_id to be nullable
        await queryInterface.changeColumn(
            'playbooks',
            'organization_id',
            {
                type: DataTypes.UUID,
                allowNull: true,
            },
            { transaction }
        );

        // 2. Add new columns
        await queryInterface.addColumn('playbooks', 'tone', {
            type: DataTypes.STRING,
            allowNull: true,
        }, { transaction });

        await queryInterface.addColumn('playbooks', 'icon', {
            type: DataTypes.STRING,
            allowNull: true,
        }, { transaction });

        await queryInterface.addColumn('playbooks', 'target', {
            type: DataTypes.STRING,
            allowNull: true,
        }, { transaction });

        await queryInterface.addColumn('playbooks', 'est_time', {
            type: DataTypes.STRING,
            allowNull: true,
        }, { transaction });

        await queryInterface.addColumn('playbooks', 'how_it_works', {
            type: DataTypes.TEXT,
            allowNull: true,
        }, { transaction });

        // 3. Seed 5 consumer playbooks
        const playbooksData = [
            {
                id: randomUUID(),
                title: 'Deep Focus Routine',
                slug: 'deep-focus-routine',
                description: 'Sharpen attention and cut distractions.',
                associated_skills: ['cognition-attention'],
                associated_moods: ['mood-focus'],
                game_ids: ['whack-em-all', 'match-3', 'hidden-objects'],
                tone: 'tone--pink',
                icon: 'playbook-focus',
                target: 'Attention',
                est_time: '11–21 min',
                how_it_works: 'Play the three in order, in one sitting or across a week. The first asks you to hold one target while the board pulls at you, the second to stop a response you have already started, and the third to search a still image without losing your place. Finish the set and the attention reading moves as one rather than three separate scores.',
                created_at: new Date()
            },
            {
                id: randomUUID(),
                title: 'Brain Activation for Learning',
                slug: 'learning-playbook',
                description: 'Prime your brain for new information with these cognitive warm-ups.',
                associated_skills: ['cognition-memory'],
                associated_moods: null,
                game_ids: ['change-word', 'alchemy', 'sweet-memory'],
                tone: 'tone--blue',
                icon: 'playbook-learning',
                target: 'Learning',
                est_time: '10-15 min',
                how_it_works: 'Warm up your cognitive flexibility and memory before diving into new concepts.',
                created_at: new Date()
            },
            {
                id: randomUUID(),
                title: 'Mindful Relaxation',
                slug: 'wellness-playbook',
                description: 'Decompress and reduce stress with calming, low-pressure activities.',
                associated_skills: null,
                associated_moods: ['mood-relax'],
                game_ids: ['zen-puzzle', 'color-sort', 'garden-match'],
                tone: 'tone--purple',
                icon: 'playbook-wellness',
                target: 'Wellness',
                est_time: '15-20 min',
                how_it_works: 'A calming sequence to lower stress and encourage a mindful state.',
                created_at: new Date()
            },
            {
                id: randomUUID(),
                title: 'Morning Momentum',
                slug: 'morning-momentum',
                description: 'Start your day with a quick cognitive jumpstart.',
                associated_skills: ['cognition-problem-solving'],
                associated_moods: ['mood-energetic'],
                game_ids: ['fast-math', 'logic-blocks', 'pattern-dash'],
                tone: 'tone--orange',
                icon: 'playbook-focus',
                target: 'Energy',
                est_time: '5-10 min',
                how_it_works: 'Get your gears turning with fast-paced problem solving.',
                created_at: new Date()
            },
            {
                id: randomUUID(),
                title: 'Evening Wind Down',
                slug: 'evening-wind-down',
                description: 'Gentle puzzles to help you transition into rest.',
                associated_skills: ['cognition-spatial'],
                associated_moods: ['mood-calm'],
                game_ids: ['jigsaw-bliss', 'connect-the-dots', 'water-sort'],
                tone: 'tone--magenta',
                icon: 'playbook-wellness',
                target: 'Relaxation',
                est_time: '10-20 min',
                how_it_works: 'Slow down with these gentle spatial and logic puzzles.',
                created_at: new Date()
            }
        ];

        await queryInterface.bulkInsert('playbooks', playbooksData, { transaction });

        await transaction.commit();
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

export const down = async ({ context: sequelize }: { context: Sequelize }) => {
    const queryInterface = sequelize.getQueryInterface();
    const transaction = await sequelize.transaction();

    try {
        // Remove the seeded consumer playbooks
        await queryInterface.bulkDelete('playbooks', { organization_id: null }, { transaction });

        // Remove the added columns
        await queryInterface.removeColumn('playbooks', 'how_it_works', { transaction });
        await queryInterface.removeColumn('playbooks', 'est_time', { transaction });
        await queryInterface.removeColumn('playbooks', 'target', { transaction });
        await queryInterface.removeColumn('playbooks', 'icon', { transaction });
        await queryInterface.removeColumn('playbooks', 'tone', { transaction });

        // Change organization_id back to NOT NULL
        // Note: This might fail if there are still records with null organization_id, 
        // but we deleted them above.
        await queryInterface.changeColumn(
            'playbooks',
            'organization_id',
            {
                type: DataTypes.UUID,
                allowNull: false,
            },
            { transaction }
        );

        await transaction.commit();
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};
