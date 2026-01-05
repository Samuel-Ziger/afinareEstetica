import { getAuth, signInWithEmailAndPassword } from "firebase/auth"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { auth, db } from "../lib/firebase"

// Script para verificar e corrigir o role do usuário admin
// Email: admin@afinare.com
// Password: admin123456

async function fixAdminRole() {
  try {
    console.log("Verificando usuário admin...")

    // Fazer login como admin
    const userCredential = await signInWithEmailAndPassword(
      auth,
      "admin@afinare.com",
      "admin123456"
    )

    const userId = userCredential.user.uid
    console.log("UID do admin:", userId)

    // Verificar se o documento existe
    const userDoc = await getDoc(doc(db, "users", userId))

    if (!userDoc.exists()) {
      console.log("Documento não existe. Criando...")
      await setDoc(doc(db, "users", userId), {
        email: "admin@afinare.com",
        role: "admin",
        createdAt: new Date().toISOString(),
      })
      console.log("✅ Documento criado com role admin")
    } else {
      const userData = userDoc.data()
      console.log("Dados atuais do usuário:", userData)

      if (userData?.role !== "admin") {
        console.log("Role não é admin. Atualizando...")
        await setDoc(
          doc(db, "users", userId),
          {
            ...userData,
            role: "admin",
          },
          { merge: true }
        )
        console.log("✅ Role atualizado para admin")
      } else {
        console.log("✅ Usuário já tem role admin")
      }
    }

    // Verificar novamente
    const updatedDoc = await getDoc(doc(db, "users", userId))
    console.log("Dados finais:", updatedDoc.data())
  } catch (error: any) {
    console.error("Erro ao corrigir role do admin:", error.message)
    if (error.code === "auth/user-not-found") {
      console.log("Usuário não encontrado. Execute primeiro o script create-admin-user.ts")
    }
  }
}

fixAdminRole()
