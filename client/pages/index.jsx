import logo from '/assets/logo.png'

export function getMeta () {
  return {
    title: 'Welcome to @fastify/react!'
  }
}

export default function Index () {
  return (
    <>
      <img style={{width: '100%'}} src={logo} />
      <Prompt />
    </>
  )
}

function Prompt() {
  function query(formData) {
    const query = formData.get("query");
    console.log("Query", query);
  }

  return (
    <div>
      <form action={query}>
        <input type="text" name="query" />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}