import { createUserWithEmailAndPassword } from "firebase/auth"
import { doc, setDoc } from "firebase/firestore"
import { auth, db } from "../lib/firebase"

// Script to create admin user
// Email: admin@afinare.com
// Password: admin123456

async function createAdminUser() {
  try {
    console.log("Creating admin user...")

    const userCredential = await createUserWithEmailAndPassword(auth, "admin@afinare.com", "admin123456")

    // Add admin role to Firestore
    await setDoc(doc(db, "users", userCredential.user.uid), {
      email: "admin@afinare.com",
      role: "admin",
      createdAt: new Date().toISOString(),
    })

    console.log("✅ Admin user created successfully!")
    console.log("Email: admin@afinare.com")
    console.log("Password: admin123456")
  } catch (error: any) {
    if (error.code === "auth/email-already-in-use") {
      console.log("ℹ️  Admin user already exists")
    } else {
      console.error("Error creating admin user:", error.message)
    }
  }
}

createAdminUser()
