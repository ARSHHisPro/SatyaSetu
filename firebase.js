// Satyasetu - Firebase Firestore Integration (Global compat script version)

let db = null;
let auth = null;
let isInitialized = false;

window.FIREBASE = {
    async init(onAuthChangeCallback) {
        if (isInitialized) return { success: true, db, auth };

        try {
            if (typeof firebase === 'undefined') {
                throw new Error("Firebase SDK libraries not loaded.");
            }

            let app;
            if (firebase.apps && firebase.apps.length > 0) {
                app = firebase.apps[0];
            } else {
                app = firebase.initializeApp(window.CONFIG.CLOUD_CONFIG);
            }
            db = firebase.firestore(app);

            try {
                await db.enablePersistence({ synchronizeTabs: true });
                console.log("Firestore offline persistence activated successfully.");
            } catch (err) {
                if (err.code == 'failed-precondition') {
                    console.warn("Multiple tabs open, persistence enabled in first tab only.");
                } else if (err.code == 'unimplemented') {
                    console.warn("The current browser does not support offline persistence.");
                }
            }

            auth = firebase.auth(app);

            if (onAuthChangeCallback) {
                auth.onAuthStateChanged((user) => {
                    onAuthChangeCallback(user);
                });
            }

            await auth.signInAnonymously();
            
            isInitialized = true;
            console.log("Firebase compatibility stack initialized successfully.");
            return { success: true, db, auth };
            
        } catch (err) {
            console.error("Firebase Initialization Failure:", err);
            isInitialized = false;
            return { success: false, error: err };
        }
    },

    async submitComplaint(payload) {
        if (!db) throw new Error("Database service is offline.");

        try {
            const complaintsCollection = db.collection('artifacts').doc(window.CONFIG.APP_ID).collection('public').doc('data').collection('complaints');
            const docId = payload.id || complaintsCollection.doc().id;
            const data = {
                ...payload,
                id: docId,
                updated_at: new Date().toISOString()
            };
            await complaintsCollection.doc(docId).set(data, { merge: true });
            return { success: true, id: docId, data };
        } catch (err) {
            console.error("Firestore Write Error:", err);
            throw err;
        }
    },
 
    async submitFeedback(payload) {
        if (!db) throw new Error("Database service is offline.");

        try {
            const feedbacksCollection = db.collection('artifacts').doc(window.CONFIG.APP_ID).collection('public').doc('data').collection('feedbacks');
            const docId = feedbacksCollection.doc().id;
            const data = {
                ...payload,
                id: docId,
                created_at: new Date().toISOString()
            };
            await feedbacksCollection.doc(docId).set(data);
            return { success: true, id: docId, data };
        } catch (err) {
            console.error("Firestore Feedback Write Error:", err);
            throw err;
        }
    },

    subscribeToComplaints(onUpdateCallback, onErrorCallback) {
        if (!db) {
            if (onErrorCallback) onErrorCallback(new Error("Database offline"));
            return null;
        }

        try {
            const complaintsCollection = db.collection('artifacts').doc(window.CONFIG.APP_ID).collection('public').doc('data').collection('complaints');
            
            return complaintsCollection.onSnapshot((snapshot) => {
                const list = [];
                snapshot.forEach(docSnap => {
                    const data = docSnap.data() || {};
                    list.push({
                        ...data,
                        id: data.id || docSnap.id,
                        _firestore_id: docSnap.id
                    });
                });
                
                list.sort((a, b) => {
                    const timeA = new Date(a.created_at || 0).getTime();
                    const timeB = new Date(b.created_at || 0).getTime();
                    return timeB - timeA;
                });

                onUpdateCallback(list);
            }, (error) => {
                console.error("Firestore Subscription Error:", error);
                if (onErrorCallback) onErrorCallback(error);
            });
        } catch (err) {
            console.error("Firestore setup sync error:", err);
            if (onErrorCallback) onErrorCallback(err);
            return null;
        }
    },

    async deleteComplaint(docId) {
        if (!db) throw new Error("Database service is offline.");

        try {
            const docRef = db.collection('artifacts').doc(window.CONFIG.APP_ID).collection('public').doc('data').collection('complaints').doc(docId);
            await docRef.delete();
            return { success: true };
        } catch (err) {
            console.error("Firestore Delete Error:", err);
            throw err;
        }
    },

    async getAdminPassword() {
        if (!db) return null;
        try {
            const docRef = db.collection('artifacts').doc(window.CONFIG.APP_ID).collection('public').doc('config');
            const snap = await docRef.get();
            if (snap.exists()) {
                const data = snap.data();
                const cloudPass = data.admin_password || null;
                if (cloudPass) {
                    localStorage.setItem('satyasetu_admin_pass', cloudPass);
                    return cloudPass;
                }
            }
        } catch (err) {
            console.warn("Could not read admin credentials from cloud:", err);
        }
        return null;
    },

    async setAdminPassword(newPassword) {
        localStorage.setItem('satyasetu_admin_pass', newPassword);
        if (!db) return true;
        try {
            const docRef = db.collection('artifacts').doc(window.CONFIG.APP_ID).collection('public').doc('config');
            await docRef.set({ admin_password: newPassword }, { merge: true });
            return true;
        } catch (err) {
            console.error("Cloud password update error:", err);
            return true;
        }
    },

    isReady() {
        return isInitialized && db !== null && auth !== null && auth.currentUser !== null;
    }
};
