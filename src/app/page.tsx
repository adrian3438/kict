import '@/app/assets/scss/login.scss'
import Image from "next/image";
import Login from "@/components/Login";


export default function Home() {
  return (
    <div className="login">
        <h1><Image src="/images/login/login-logo.png" alt="KICT 한국건설기술연구원" width={354} height={98}/></h1>
        <Login/>
    </div>
  );
}
