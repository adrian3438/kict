import '@/app/assets/scss/dashboard.scss'
import SideBar from "@/components/SideBar";
import ImageSlider from "@/components/ImageSlider";
import Image from "next/image";
import Chart from "@/components/Chart";
import Modeling from '@/components/Modeling';

export default function Dashboard() {
  return (
    <>
        <SideBar/>
        <div className="container-wrap">
            <div className="container">
                <section className="location">
                    <ul>
                        <li>대표교량 일반 정보</li>
                        <li>가납교</li>
                    </ul>
                </section>
                <section id="section01">
                    <h3>가납교</h3>
                    <table>
                        <tbody>
                        <tr>
                            <th scope="row">교량형식</th>
                            <td>RC슬래브교</td>
                            <th scope="row">등급</th>
                            <td>A</td>
                        </tr>
                        <tr>
                            <th scope="row">준공년도</th>
                            <td>1996년</td>
                            <th scope="row">공용연수</th>
                            <td>28년</td>
                        </tr>
                        <tr>
                            <th scope="row">연장</th>
                            <td>61m</td>
                            <th scope="row">폭</th>
                            <td>22m</td>
                        </tr>
                        <tr>
                            <th scope="row">높이</th>
                            <td>4m</td>
                            <th scope="row">노선</th>
                            <td>-</td>
                        </tr>
                        <tr>
                            <th scope="row">주소</th>
                            <td colSpan={3}>경기도 양주시 광적면 가납리</td>
                        </tr>
                        </tbody>
                    </table>

                    <ImageSlider/>
                </section>
                <section id="section02">
                    <h3>자유진동 해석</h3>
                    <h4>자유진동 해석 Value 1 (임의 제목)</h4>
                    <table>
                        <thead>
                        <tr>
                            <th scope="col">No.</th>
                            <th scope="col">EigenValue</th>
                            <th scope="col">Ntl.Cir.Freq.<br/>(rad/sec)</th>
                            <th scope="col">NatFreq<br/>(Hz)</th>
                            <th scope="col">MainDir.<br/>(sec)</th>
                            <th scope="col">MaxNode</th>
                            <th scope="col">Dof</th>
                            <th scope="col">Phi*Phi</th>
                            <th scope="col">Phi*M*Phi</th>
                            <th scope="col">Phi*K*Phi</th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr>
                            <td>1</td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                        </tr>
                        <tr>
                            <td>2</td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                        </tr>
                        <tr>
                            <td>3</td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                        </tr>
                        <tr>
                            <td>4</td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                        </tr>
                        <tr>
                            <td>5</td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                        </tr>
                        <tr>
                            <td>6</td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                        </tr>
                        <tr>
                            <td>7</td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                        </tr>
                        <tr>
                            <td>8</td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                        </tr>
                        <tr>
                            <td>9</td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                        </tr>
                        <tr>
                            <td>10</td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                        </tr>
                        </tbody>
                    </table>
                    <ul className="capture-list">
                        <li><Image src="/images/@temp/capture-sample.png" alt="캡쳐이미지" width={679} height={331}/></li>
                        <li><Image src="/images/@temp/capture-sample.png" alt="캡쳐이미지" width={679} height={331}/></li>
                        <li><Image src="/images/@temp/capture-sample.png" alt="캡쳐이미지" width={679} height={331}/></li>
                        <li><Image src="/images/@temp/capture-sample.png" alt="캡쳐이미지" width={679} height={331}/></li>
                    </ul>
                </section>

                <section id="section03">
                    <h3>이동하중 시뮬레이션</h3>
                    <Chart/>
                </section>

                <section id="section04">
                    <Modeling/>
                </section>
            </div>
        </div>
    </>
  );
}
