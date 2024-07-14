import mongoose from 'mongoose';

const connection = {
    isConnected: mongoose.ConnectionStates.uninitialized
};

export async function connect(){
    try{
        if (connection.isConnected === mongoose.ConnectionStates.connected) return;

        const db = await mongoose.connect(process.env.DATABASE_URL!);

        connection.isConnected = db.connections[0].readyState;
        const mConnection = mongoose.connection;

        mConnection.on('connected', () => {
            console.log('mongoDB connected successfully');
        });

        mConnection.on('error', (err) => {
            console.log('mongoDB connection error. Please make sure mongoDB is runnning' + err);
            process.exit();
        });
    }catch(err){
        console.log('something went wrong:' + err);
    }
}