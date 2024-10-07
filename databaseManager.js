const { MongoClient, ServerApiVersion } = require('mongodb');
require("dotenv").config();

class DatabaseManager {
    #client
    #dbName
    #collection

    constructor() {
        this.#dbName = process.env.MONGO_DB_NAME;
        this.#collection = process.env.MONGO_COLLECTION;
    }
    
    async connect() {
        let userName = process.env.MONGO_DB_USERNAME;
        let password = process.env.MONGO_DB_PASSWORD;
        
        const uri = `mongodb+srv://${userName}:${password}@cluster0.uzwa1qh.mongodb.net/?retryWrites=true&w=majority`;
        this.#client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
        
        await this.#client.connect();
    }

    async listDatabases() {
        await this.connect();
        const dbsList = await this.#client.db().admin().listDatabases();
    
        console.log("Databases: ");
        dbsList.databases.forEach(db => {
            console.log(`DB Name: ${db.name}`);
        });
        console.log("Collection:");
        console.log(`${this.#collection}`);
    }

    async insertApplication(application) {
        await this.connect();
        await this.#client.db(this.#dbName).collection(this.#collection).insertOne(application);
        await this.#client.close();
    }

    async lookUpApplication(email) {
        await this.connect();
        let filter = {email: email};
        const result = await this.#client.db(this.#dbName).collection(this.#collection).findOne(filter);
        await this.#client.close();
        return result;
    }


    async lookUpGPA(gpa) {
        await this.connect();
        let filter = {gpa: {$gte: gpa}};
        const apps = await this.#client.db(this.#dbName).collection(this.#collection).find(filter);
        const result = await apps.toArray();
        await this.#client.close();
        return result;
    }

    async deleteAllApplications() {
       await this.connect();
       const result = await this.#client.db(this.#dbName).collection(this.#collection).deleteMany({});
       await this.#client.close();
       return result.deletedCount;
    }
}

module.exports = { DatabaseManager }