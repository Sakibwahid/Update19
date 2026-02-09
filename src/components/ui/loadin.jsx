import LoadingPNG from "/public/football.png"; 
const Loadin = ({children}) =>{

    return(
        <div className="flex flex-col space-y-4 items-center">
        <img
            src={LoadingPNG}
            className="w-16 h-16 object-fit animate-spin opacity-90"
          />
          {children}
        </div>
    )
}
export default Loadin;