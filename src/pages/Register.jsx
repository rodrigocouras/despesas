import { useState } from "react";
import { supabase } from "../supabaseClient";

function Register({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");

  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [aCarregar, setACarregar] = useState(false);

  const handleRegister = async (e) => {
  e.preventDefault();

  setErro("");
  setSucesso("");

  if (password !== confirmarPassword) {
    setErro("As palavras-passe não coincidem.");
    return;
  }

  if (password.length < 6) {
    setErro(
      "A palavra-passe deve ter pelo menos 6 caracteres."
    );
    return;
  }

  setACarregar(true);

  const {  error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    setErro(error.message);
  } else {
    setSucesso(
      "Conta criada! Verifica o teu email para confirmares a conta."
    );
  }

  setACarregar(false);
};
  return (
    <div className="auth-page">
      <div className="auth-card">

        <div className="auth-logo">
          €
        </div>

        <h1>Criar conta</h1>

        <p className="auth-subtitle">
          Cria a tua conta para começares.
        </p>

        <form onSubmit={handleRegister}>

          <div className="form-group">
            <label>Email</label>

            <input
              type="email"
              placeholder="exemplo@email.com"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              required
            />
          </div>

          <div className="form-group">
            <label>Palavra-passe</label>

            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              required
            />
          </div>

          <div className="form-group">
            <label>Confirmar palavra-passe</label>

            <input
              type="password"
              placeholder="••••••••"
              value={confirmarPassword}
              onChange={(e) =>
                setConfirmarPassword(
                  e.target.value
                )
              }
              required
            />
          </div>

          {erro && (
            <div className="auth-error">
              {erro}
            </div>
          )}

          {sucesso && (
            <div className="auth-success">
              {sucesso}
            </div>
          )}

          <button
            type="submit"
            className="auth-button"
            disabled={aCarregar}
          >
            {aCarregar
              ? "A criar conta..."
              : "Criar conta"}
          </button>

        </form>

        <p className="auth-footer">
          Já tens uma conta?

          <button
            type="button"
            onClick={onLogin}
          >
            Entrar
          </button>
        </p>

      </div>
    </div>
  );
}

export default Register;