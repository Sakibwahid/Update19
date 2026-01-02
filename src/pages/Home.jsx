import { Button } from "../components/ui/Button";
import { Anchor } from "../components/ui/Anchor";
const Home = () => {
  return (
    <div className="h-screen flex flex-col gap-4 justify-center items-center">
      <h1>Welcome to the Home Page</h1>
      <p>This is the main landing page of the application.</p>
      <Button variant="filled">
        <Anchor to="/login" className="text-indigo-300 hover:text-indigo-400">
          Log in
        </Anchor>
      </Button>
    </div>
  );
};
export default Home;
