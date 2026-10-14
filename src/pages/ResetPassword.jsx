import { useState } from "react";
import { supabase } from "../supabaseClient";

function ResetPassword({ onComplete, onBack }) {
  const [password, setPassword] = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState(false);
  const [aCarregar, setACarregar] = useState(false);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setErro("");

    if (password.length < 6) {
      setErro("A palavra-passe deve ter pelo menos 6 caracteres.");
      return;
    }

    if (password !== confirmarPassword) {
      setErro("As palavras-passe não coincidem.");
      return;
    }

    setACarregar(true);

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setErro(error.message);
    } else {
      setSucesso(true);
    }

    setACarregar(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-background" aria-hidden="true">
        <div className="auth-shape auth-shape-1"></div>
        <div className="auth-shape auth-shape-2"></div>
      </div>

      <div className="auth-card">
        <div className="auth-brand">
          <div className="auth-logo">€</div>
          <span>Finanças</span>
        </div>

        <div className="auth-header">
          <h1>
            {sucesso ? "Palavra-passe atualizada" : "Redefinir palavra-passe"}
          </h1>
          <p>
            {sucesso
              ? "Já podes entrar na tua conta com a nova palavra-passe."
              : "Escolhe uma nova palavra-passe para a tua conta."}
          </p>
        </div>

        {sucesso ? (
          <button type="button" className="auth-button" onClick={onComplete}>
            Voltar à aplicação
          </button>
        ) : (
          <form onSubmit={handleResetPassword}>
            <div className="form-group">
              <label htmlFor="nova-palavra-passe">Nova palavra-passe</label>
              <input
                id="nova-palavra-passe"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmar-palavra-passe">
                Confirmar palavra-passe
              </label>
              <input
                id="confirmar-palavra-passe"
                type="password"
                placeholder="••••••••"
                value={confirmarPassword}
                onChange={(e) => setConfirmarPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
            </div>

            {erro && (
              <div className="auth-error" role="alert">
                {erro}
              </div>
            )}

            <button
              type="submit"
              className="auth-button"
              disabled={aCarregar}
            >
              {aCarregar ? "A atualizar..." : "Guardar nova palavra-passe"}
            </button>

            <p className="auth-footer">
              <button type="button" onClick={onBack}>
                Voltar a entrar
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

export default ResetPassword;
