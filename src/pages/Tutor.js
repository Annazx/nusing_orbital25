const Tutor = () => {
  return (
    <>
      <head>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/water.css@2/out/water.css"></link>
      </head>
      <h1>Sign up as a Peer Tutor</h1>
      <form>
        <fieldset>
          <legend>Personal Information</legend>
          <label for="full-name">Full Name:</label>
          <input type="text" name="name" id="name" placeholder="Ex: Ethan Tan"></input>
          <label for="yr">Year of Study:</label>
          <select name="yr" id="year">
            <option value="y1-option">y1</option>
            <option value="y2-option">y2</option>
            <option value="y3-option">y3</option>
            <option value="y4-option">y4</option>
          </select>
        </fieldset>
        <fieldset>
          <legend>Contact</legend>
          <label for="email">Email:</label>
          <input type="text" name="email" id="email" placeholder="Ex: eXXXXXXXN@u.nus.edu"></input>
          <label for="phone-number">Phone No:</label>
          <input type="text"></input>
        </fieldset>
        <fieldset>
          <legend>Add Classes</legend>
        </fieldset>
        <fieldset>
          <legend>Add bio</legend>
        </fieldset>
      </form>
    </>
  );
};

export default Tutor;