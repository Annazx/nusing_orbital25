export function Header(props) {
    return (
        <header>
            <h1>Tutor's Dashboard</h1>
            <h3>You have 3 upcoming appointments.</h3>
        </header>
    )
}

const Tutor = () => {
  return (
    <>
      <Header />
    </>
  );
};

export default Tutor;