"use client";

import { useActionState } from "react";
import { createBusiness, type OnboardingState } from "./actions";

const initialState: OnboardingState = { error: null };

export default function OnboardingForm() {
  const [state, formAction, pending] = useActionState(
    createBusiness,
    initialState,
  );

  return (
    <form action={formAction}>
      <label htmlFor="name">Nome do seu negócio</label>
      <input
        id="name"
        name="name"
        type="text"
        required
        placeholder="Ex: Studio Bela Flor"
      />
      {state.error && (
        <div className="error-msg" style={{ marginTop: 14 }}>
          {state.error}
        </div>
      )}
      <button className="primary" type="submit" disabled={pending}>
        {pending ? "Criando..." : "Criar meu espaço"}
      </button>
    </form>
  );
}
