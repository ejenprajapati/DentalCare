import dentistPic from "../assets/dentist_pic.jpg";
// import {Button} from "./ui/Button.tsx";
function Card(){
return(
   
    <div className="card">
        <img className="card-image" src={dentistPic} alt="Dentist Pic"></img>
        <h2 className="card-title">Dentist</h2>
        <p className="card-text">A dentist that work for dental Care</p>
        {/* <Button/> */}
    </div>
    
   
    
);
}
export default Card