import { Text } from "./Text";
export function Stats({ width, label }) {
    return (
      <div className={`w-full  mb-3` }>
        <div className="flex items-center justify-between text-white text-sm">
          <Text className="text-white text-lg">{label}</Text>
          <Text className="text-white text-lg">{width}</Text>
        </div>
        <div className="w-full h-[5px] bg-white rounded">
          <div className="h-full bg-[#26ff00] rounded" style={{ width: `${width}%` }}></div>
        </div>
      </div>
    );
  }

  export default Stats;
  