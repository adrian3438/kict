import React from "react";
import Link from "next/link";

export default function Login() {
    return(
        <section>
            <h2>WebGL 기반 교량 해석 플랫폼</h2>
            <div>
                <label>
                    <span>아이디</span>
                    <input type="text"/>
                </label>
                <label>
                    <span>패스워드</span>
                    <input type="password"/>
                </label>
                {/*<button>로그인</button>*/}
                <div>
                    <Link href="/dashboard">로그인</Link>
                </div>
            </div>
        </section>
    )
}
