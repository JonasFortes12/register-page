"use client";

import React, { useState, useEffect } from "react";
import { Form, Input, Button } from "@heroui/react";
import { database } from "@/app/firebase";
import { ref, set, onValue, remove, off } from "firebase/database";
import Image from "next/image";

export default function Home() {
  const [loading, setLoading] = useState<Boolean>(false);
  const [success, setSuccess] = useState<Boolean>(false);
  const [pending, setPending] = useState<Boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const TIMER = 120; // em segundos
  const [timer, setTimer] = useState<number>(TIMER); // 2 minutos em segundos

  // Verifica usuários pendentes e inicia timer
  useEffect(() => {
    const pendingUsersRef = ref(database, "pendingUser");

    onValue(ref(database, "pendingUser/current"), (snapshot) => {
      if (snapshot.exists()) {
        setPending(true);
        startTimer();
      } else {
        setPending(false);
      }
    });

    return () => {
      off(pendingUsersRef); // Remove o listener quando o componente desmontar
    };
  }, []);

  // Timer countdown
  useEffect(() => {
    if (timer > 0 && pending) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else if (timer === 0 && pending) {
      clearPendingUsers();
    }
  }, [timer, pending]);

  // funcão para reiniciar o timer
  const startTimer = () => {
    setTimer(TIMER); // Reinicia o timer para 2 minutos
  };

  // Limpa usuário pendente
  const clearPendingUsers = async () => {
    try {
      const pendingUsersRef = ref(database, "pendingUser");
      await remove(pendingUsersRef);
      setPending(false);
    } catch (err) {
      setError("Erro ao limpar cadastros pendentes");
    }
  };

  // Reseta estados
  const handleReset = () => {
    setError(null);
    setSuccess(false);
    setLoading(false);
  };

  // Formata o tempo restante para exibição
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Envia dados do usuário para o Firebase
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    if(pending) {
      setError("Já existe um cadastro pendente. Aguarde a finalização ou o tempo expirar.");
      setLoading(false);
      return;
    }

    const formData = new FormData(e.currentTarget);
    const userData = {
      username: formData.get("username"),
      email: formData.get("email"),
      timestamp: new Date().toISOString(),
    };

    try {
      // Adiciona usuário pendente ao Firebase
      const pendingUsersRef = ref(database, "pendingUser");
      await set(ref(database, "pendingUser/current"), userData);

      setLoading(false);
      setSuccess(true);
    } catch (err) {
      setError("Erro ao enviar dados. Por favor, tente novamente.");
      setLoading(false);
    }
  };

  return (
    <main className="bg-slate-50 flex flex-col h-screen items-center justify-center gap-5 p-2 ">
      <Image
        src="/logo-pet-flat-escuro.svg"
        alt="Logo do PET"
        width={200}
        height={200}
      />
      <div className="mb-8 text-center max-w-lg">
      <p className="text-gray-700 font-semibold">
        Preencha o formulário abaixo para iniciar o cadastro de acesso com
        biometria ou tag/cartão RFID no laboratório PET.
      </p>
      </div>
      <Form
        className="w-full max-w-xs flex flex-col gap-4"
        onReset={handleReset}
        onSubmit={handleSubmit}
      >
        <Input
          isRequired
          errorMessage="Por favor, insira seu nome completo"
          label="Nome do Usuário"
          labelPlacement="outside"
          name="username"
          placeholder="Digite seu nome completo"
          type="text"
        />

        <Input
          isRequired
          errorMessage="Por favor, insira um email válido"
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

      {/* Mensagens de status */}
      {loading && (
        <div className="bg-blue-100 flex flex-col items-center justify-center mt-4 border p-4 rounded-lg">
          <h1 className="text-blue-700 font-bold block text-lg">Aguarde...</h1>
          <p className="text-blue-700 max-w-md text-center">
            Estamos iniciando seu cadastro. Por favor, aguarde alguns instantes.
          </p>
        </div>
      )}

      {success && (
        <div className="bg-green-100 flex flex-col items-center justify-center mt-4 border p-4 rounded-lg">
          <h1 className="text-green-700 font-bold block text-lg">
            Cadastro iniciado com sucesso!
          </h1>
          <p className="text-green-700 max-w-md text-center font-medium mb-2">
            Complete seu cadastro:
          </p>
          <ul className="text-green-700 max-w-md text-left flex flex-col gap-2">
            <li>1. Na fechadura eletrônica, altere para o modo de cadastro.</li>
            <li>2. Insira sua biometria ou sua tag/cartão RFID.</li>
            <li>3. Espere finalização do cadastro.</li>
            <li className="font-semibold">
              Tempo restante: {formatTime(timer)}
            </li>
          </ul>
        </div>
      )}

      {pending && !success && (
        <div className="bg-yellow-100 flex flex-col items-center justify-center mt-4 border p-4 rounded-lg">
          <h1 className="text-yellow-700 font-bold block text-lg">
            Cadastro pendente!
          </h1>
          <p className="text-yellow-700 max-w-md text-center">
            Há um cadastro em andamento. Aguarde a finalização ou o tempo
            expirar ({formatTime(timer)}).
          </p>
        </div>
      )}

      {error && (
        <div className="bg-red-100 flex flex-col items-center justify-center mt-4 border p-4 rounded-lg">
          <h1 className="text-red-700 font-bold block text-lg">Erro!</h1>
          <p className="text-red-700 max-w-md text-center">{error}</p>
        </div>
      )}
    </main>
  );
}
