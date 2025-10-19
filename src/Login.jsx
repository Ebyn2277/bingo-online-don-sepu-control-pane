export function Login({ login }) {
  const onSubmitHandler = async (event) => {
    event.preventDefault();
    const email = event.target.email.value;
    const password = event.target.password.value;

    const result = await login(email, password);
    if (!result.success) {
      alert("An error occurred during login.");
    }
  };

  return (
    <>
      <section className="login">
        <h1>Iniciar Sesión</h1>
        <form className="login-form" onSubmit={onSubmitHandler}>
          <label htmlFor="email">Correo:</label>
          <input type="email" name="email" required />
          <label htmlFor="password">Contraseña:</label>
          <input type="password" name="password" required />
          <button type="submit">Iniciar Sesión</button>
        </form>
      </section>
    </>
  );
}
