import React from "react";
import Link from "next/link";

export default function Login() {
    return (
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
                <div className="login-btn-area">
                    <Link href="/dashboard" className="login-btn-area">로그인</Link>
                    {/*<button className="login-btn-area">로그인</button>*/}
                </div>
            </div>
        </section>
    )
}
