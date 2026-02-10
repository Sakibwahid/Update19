import { Button } from "../components/ui/Button";
import { Text } from "../components/ui/Text";
import { Anchor } from "../components/ui/Anchor";
import { useAuth } from "../context/AuthContext";
import Loadin from "../components/ui/loadin";

const Home = () => {
  const { user, loading } = useAuth();

  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loadin>Loading...</Loadin>
      </div>
    );
  }

  return (
    <div className="md:h-full p-2 relative flex flex-col justify-center items-center">
      <div className="flex flex-col justify-center items-center gap-6">
        <Text
          variant="heading"
          className="font-[orbitron] text-white text-center"
        >
          Enjoy your FIFA like never before
        </Text>

        <Text
          variant="subheading"
          className="font-[rajdhani] text-white font-normal"
        >
          Bid for your favourite
        </Text>

        <div className="mt-4">
          {!user ? (
            <Anchor to="/login">
              <Button size="md">Login</Button>
            </Anchor>
          ) : (
            <Anchor to="/user">
              <Button size="md">Dashboard</Button>
            </Anchor>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
