// Satyasetu - Cloud Integration with Realtime Database (Global compat script version)

let db = null;
let auth = null;
let isInitialized = false;

window.CLOUD = {
    async init(onAuthChangeCallback) {
        if (isInitialized) return { success: true, db, auth };

        try {
            if (typeof firebase === 'undefined') {
                throw new Error("Cloud SDK libraries not loaded.");
            }

            let app;
            if (firebase.apps && firebase.apps.length > 0) {
                app = firebase.apps[0];
            } else {
                app = firebase.initializeApp(window.CONFIG.CLOUD_CONFIG);
            }
            db = firebase.database(app);

            auth = firebase.auth(app);

            if (onAuthChangeCallback) {
                auth.onAuthStateChanged((user) => {
                    onAuthChangeCallback(user);
                });
            }

            await auth.signInAnonymously();
            
            isInitialized = true;
            console.log("Secure cloud Realtime Database synchronization protocol established.");
            return { success: true, db, auth };
            
        } catch (err) {
            console.error("Cloud initialization failure:", err);
            isInitialized = false;
            return { success: false, error: err };
        }
    },

    async submitComplaint(payload) {
        if (!db) throw new Error("Database service is offline.");

        try {
            const ref = db.ref('artifacts/' + window.CONFIG.APP_ID + '/public/data/complaints');
            const docId = payload.id || ref.push().key;
            await ref.child(docId).set({
                ...payload,
                id: docId,
                updated_at: new Date().toISOString()
            });
            return { success: true, id: docId };
        } catch (err) {
            console.error("Cloud database write error:", err);
            throw err;
        }
    },
 
    async submitFeedback(payload) {
        if (!db) throw new Error("Database service is offline.");

        try {
            const ref = db.ref('artifacts/' + window.CONFIG.APP_ID + '/public/data/feedbacks');
            const docId = ref.push().key;
            await ref.child(docId).set({
                ...payload,
                id: docId,
                created_at: new Date().toISOString()
            });
            return { success: true, id: docId };
        } catch (err) {
            console.error("Cloud feedback write error:", err);
            throw err;
        }
    },

    subscribeToComplaints(onUpdateCallback, onErrorCallback) {
        if (!db) {
            if (onErrorCallback) onErrorCallback(new Error("Database offline"));
            return null;
        }

        try {
            const ref = db.ref('artifacts/' + window.CONFIG.APP_ID + '/public/data/complaints');
            
            const handleValue = (snapshot) => {
                const list = [];
                snapshot.forEach(childSnap => {
                    const data = childSnap.val() || {};
                    list.push({
                        ...data,
                        id: data.id || childSnap.key,
                        _firestore_id: childSnap.key
                    });
                });
                
                list.sort((a, b) => {
                    const timeA = new Date(a.created_at || 0).getTime();
                    const timeB = new Date(b.created_at || 0).getTime();
                    return timeB - timeA;
                });

                onUpdateCallback(list);
            };

            ref.on('value', handleValue, (error) => {
                console.error("Cloud subscription sync error:", error);
                if (onErrorCallback) onErrorCallback(error);
            });

            return () => ref.off('value', handleValue);
        } catch (err) {
            console.error("Cloud setup sync error:", err);
            if (onErrorCallback) onErrorCallback(err);
            return null;
        }
    },

    async deleteComplaint(docId) {
        if (!db) throw new Error("Database service is offline.");

        try {
            const ref = db.ref('artifacts/' + window.CONFIG.APP_ID + '/public/data/complaints/' + docId);
            await ref.remove();
            return { success: true };
        } catch (err) {
            console.error("Cloud database document deletion failure:", err);
            throw err;
        }
    },

    async getAdminPassword() {
        const localPass = localStorage.getItem('satyasetu_admin_pass');
        if (!db) return localPass || null;
        try {
            const ref = db.ref('artifacts/' + window.CONFIG.APP_ID + '/public/config');
            const snap = await ref.once('value');
            if (snap.exists()) {
                const data = snap.val();
                const cloudPass = data.admin_password || null;
                if (cloudPass) {
                    localStorage.setItem('satyasetu_admin_pass', cloudPass);
                    return cloudPass;
                }
            }
        } catch (err) {
            console.warn("Could not read admin credentials from cloud:", err);
        }
        return localPass || null;
    },

    async setAdminPassword(newPassword) {
        localStorage.setItem('satyasetu_admin_pass', newPassword);
        if (!db) return true;
        try {
            const ref = db.ref('artifacts/' + window.CONFIG.APP_ID + '/public/config');
            await ref.update({ admin_password: newPassword });
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
