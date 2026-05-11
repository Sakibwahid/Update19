const Loading = ({ children }) => {
  return (
    <div className="flex flex-col items-center space-y-4 text-white">
      <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>

      {children}
    </div>
  );
};

export default Loading;