import { firestore } from 'firebase-admin';

const querySnapshotToData = (doc: firestore.QueryDocumentSnapshot<firestore.DocumentData>) => {
    const data = doc.data()
    data.id = doc.id
    return data
}

export class CrudService {
    constructor(private db: firestore.Firestore) { }

    public getAll(collectionName: string, params: any, callback: (_: any) => void) {
        const collection: firestore.CollectionReference<firestore.DocumentData> = this.db.collection(collectionName);
        let documentData: firestore.Query<firestore.DocumentData> = collection.offset(0)

        for (const key in params) {
            documentData = documentData.where(key, "==", params[key])
        }

        documentData.get()
            .then(querySnapshot => {
                const data = querySnapshot.docs.map(querySnapshotToData)
                callback({ data })
            })
            .catch(error => callback({ error }))
    }

    public create = (collection: string, data: any, owner: string | undefined = undefined) =>
        new Promise((resolve, reject) => {
            const doc: firestore.DocumentReference = this.db.collection(collection).doc()
            if (owner) {
                data.owner = owner
            }

            doc.set(data)
                .then(_ => {
                    data.id = doc.id
                    resolve({ data })
                })
                .catch(error => reject({ error }))
        })

    public getById(collection: string, id: any, callback: (_: any) => void) {
        this.db.collection(collection)
            .doc(id)
            .get()
            .then(doc => {
                let data = doc.data()
                if (data) data.id = doc.id

                callback({ data })
            })
            .catch(error => callback({ error }))
    }

    public update = (collection: string, id: any, newData: any) =>
        new Promise((resolve, reject) =>
            this.db.collection(collection)
                .doc(id)
                .get()
                .then(doc => {
                    const data: any = doc.data()

                    for (const key in newData) {
                        if (key !== 'id' && key !== 'owner') {
                            data[key] = newData[key]
                        }
                    }

                    this.db.collection(collection)
                        .doc(id)
                        .set(data)
                        .then(_ => resolve({ data }))
                        .catch(reject)
                })
                .catch(reject)
        )

}