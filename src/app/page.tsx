"use client";

import React, { useState } from "react";
import { Form, Input, Button } from "@heroui/react";
import { database } from "@/app/firebase";
import { ref, push } from "firebase/database";

export default function Home() {
  

  const [loading, setLoading] = useState<Boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleReset = () => {
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      username: formData.get("username"),
      email: formData.get("email"),
      registrationCompleted: false,
      timestamp: new Date().toISOString(),
    }

    try {
      // Adiciona usuário pendente ao Firebase
      const pendingUsersRef = ref(database, "pendingUsers");
      await push(pendingUsersRef, data);
      
      setLoading(false);
      alert("Cadastro iniciado com sucesso! Por favor, complete seu cadastro no dispositivo físico.");
    } catch (err) {
      setError("Erro ao enviar dados. Por favor, tente novamente.");
      setLoading(false);
      console.error("Error adding document: ", err);
    }

  };
  
  
  return (
    <main className="flex flex-col items-center justify-between p-24">
      <h1 className="text-2xl font-bold mb-10">Registre-se Acesso Biometria PET</h1>
      <Form
        className="w-full max-w-xs flex flex-col gap-4"
        onReset={handleReset}
        onSubmit={handleSubmit}
      >
        <Input
          isRequired
          errorMessage="Please enter a valid username"
          label="Nome do Usuário"
          labelPlacement="outside"
          name="username"
          placeholder="Digite seu nome completo"
          type="text"
        />

        <Input
          isRequired
          errorMessage="Please enter a valid email"
          label="Email"
          labelPlacement="outside"
          name="email"
          placeholder="Digite seu email"
          type="email"
        />
        <div className="flex gap-2">
          <Button color="primary" type="submit">
            Iniciar Cadastro
          </Button>
          <Button type="reset" variant="flat">
            Limpar
          </Button>
        </div>
      </Form>
    </main>
  );
}

