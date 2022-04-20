const supertest = require('supertest');
const app = require('../../../app');
const request = supertest(app);
const mongoose = require('mongoose');
const {Genre} = require('../../../models/genre');
const {User} = require('../../../models/user');

describe('/api/genres', () => {
    afterEach(async () => { 
        await Genre.deleteMany({});
    });

    describe('GET /', () => {
        it('should return all genres', async () => {
            await Genre.collection.insertMany([
                { name: 'genre1' },
                { name: 'genre2' },
            ]);

            const res = await request.get('/api/genres');

            expect(res.status).toBe(200);
            expect(res.body.length).toBe(2);
            expect(res.body.some(g => g.name === 'genre1')).toBeTruthy();
            expect(res.body.some(g => g.name === 'genre2')).toBeTruthy();
        });
    });

    describe('GET /:id', () => {
        it('should return a genre if valid id is passed', async () => {
            const genre = new Genre({ name: 'genre1' });
            await genre.save();

            const res = await request.get(`/api/genres/${genre._id}`);

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('name', genre.name);
        });

        it('should return 404 if invalid id is passed', async () => {
            const res = await request.get('/api/genres/invalidId');

            expect(res.status).toBe(404);
        });

        it('should return 404 if no genre with the given id exists', async () => {
            const id = mongoose.Types.ObjectId();
            const res = await request.get(`/api/genres/${id}`);

            expect(res.status).toBe(404);
        });
    });

    describe('POST /', () => {
        let token;
        let name;

        const exec = () => {
            return request
                .post('/api/genres')
                .set('x-auth-token', token)
                .send({ name });
        }

        beforeEach(() => {
            token = new User().generateAuthToken();
            name = 'genre1';
        });

        it('should return a 401 if client is not logged in', async () => {
            token = '';

            const res = await exec();

            expect(res.status).toBe(401);
        });

        it('should return a 400 if genre is less than 5 characters', async () => {
            name = '1234';

            const res = await exec();

            expect(res.status).toBe(400);
        });

        it('should return a 400 if genre is more than 50 characters', async () => {
            name = new Array(52).join('a');

            const res = await exec();

            expect(res.status).toBe(400);
        });

        it('should save the genre if it is valid', async () => {
            await exec();

            const genre = await Genre.find({ name: 'genre1' });

            expect(genre).not.toBeNull();
        });

        it('should return the genre if it is valid', async () => {
            const res = await exec();

            expect(res.body).toHaveProperty('_id');
            expect(res.body).toHaveProperty('name', 'genre1');
        });
    });

    describe('DELETE :/id', () => {
        let id;
        let token;
        let genre;

        const exec = () => {
            return request
                .delete(`/api/genres/${id}`)
                .set('x-auth-token', token)
                .send();
        }
        
        beforeEach(async () => {
            genre = new Genre({ name: 'genre1' });
            await genre.save();

            id = genre._id;
            token = new User({ isAdmin: true }).generateAuthToken();
        });

        it('should return 401 if client is not logged in', async () => {
            token = '';

            const res = await exec();

            expect(res.status).toBe(401);
        });

        it('should return 403 if user is not an admin', async () => {
            token = new User({ isAdmin: false }).generateAuthToken();

            const res = await exec();

            expect(res.status).toBe(403);
        });

        it('should return 404 if invalid id is passed', async () => {
            id = 'invalidId';
            
            const res = await exec();

            expect(res.status).toBe(404);
        });

        it('should return 404 if no genre valid id is passed', async () => {
            id = 'invalidId';
            
            const res = await exec();

            expect(res.status).toBe(404);
        });

        it('should return 404 if no genre with the given id exists', async () => {
            id = mongoose.Types.ObjectId();
            
            const res = await exec();

            expect(res.status).toBe(404);
        });

        it('should delete the genre if the input is valid', async () => {
            await exec();

            const genreInDb = await Genre.findById(id);

            expect(genreInDb).toBeNull();
        });

        it('should return the removed genre if input is valid', async () => {
            const res = await exec();

            expect(res.body).toHaveProperty('_id', genre._id.toHexString());
            expect(res.body).toHaveProperty('name', genre.name);
        });
    });

    describe('PUT /:id', () => {
        let id;
        let token;
        let genre;
        let newName;

        const exec = () => {
            return request
                .put(`/api/genres/${id}`)
                .set('x-auth-token', token)
                .send({ name: newName });
        }
        
        beforeEach(async () => {
            genre = new Genre({ name: 'genre1' });
            await genre.save();

            id = genre._id;
            token = new User({ isAdmin: true }).generateAuthToken();
            newName = 'updatedName';
        });

        it('should return 401 if client is not logged in', async () => {
            token = '';

            const res = await exec();

            expect(res.status).toBe(401);
        });

        it('should return 404 if invalid id is passed', async () => {
            id = 'invalidId';
            
            const res = await exec();

            expect(res.status).toBe(404);
        });

        it('should return 400 is new name is less than 5 characters', async () => {
            newName = '1234';

            const res = await exec();

            expect(res.status).toBe(400);
        });

        it('should return 400 is new name is greater than 50 characters', async () => {
            newName = new Array(52).join('a');

            const res = await exec();

            expect(res.status).toBe(400);
        });

        it('should return 404 if no genre with the given id exists', async () => {
            id = mongoose.Types.ObjectId();
            
            const res = await exec();

            expect(res.status).toBe(404);
        });

        it('should update the genre if the input is valid', async () => {
            await exec();

            const updatedGenre = await Genre.findById(genre._id);

            expect(updatedGenre.name).toBe(newName);
        });

        it('should return the updated genre if the input is valid', async () => {
            const res = await exec();

            expect(res.body).toHaveProperty('_id');
            expect(res.body).toHaveProperty('name', newName);
        });
    });
});