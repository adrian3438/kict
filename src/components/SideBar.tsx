import React from "react";
import Link from "next/link";
import Image from "next/image";

export default function SideBar() {
    return(
        <section className="side-bar">
            <h1><Link href="/dashboard"><Image src="/images/common/logo.png" alt="KICT 한국건설기술연구원" width={194} height={158}/></Link></h1>
            <div>
                <ul>
                    <li><Link href="#section01">대표교량 일반 정보</Link>
                        <ul>
                            <li><Link href="#">가납교</Link></li>
                        </ul>
                    </li>
                    <li><Link href="#section02">자유진동 해석</Link></li>
                    <li><Link href="#section03">이동하중 시뮬레이션</Link></li>
                </ul>
            </div>
        </section>
    )
}
