'use client';

import '@/app/assets/scss/dashboard.scss'
import SideBar from "@/components/SideBar";
import ImageSlider from "@/components/ImageSlider";
import Chart from "@/components/Chart";
import Modeling from '@/components/Modeling';
import Table from "@/components/Table";
import datas from '../../../public/resources/datas/data.json';

export default function Dashboard() {
  return (
    <>
        <SideBar/>
        <div className="container-wrap">
            <div>
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
                    <Table/>
                </section>

                <section id="section03">
                    <h3>이동하중 시뮬레이션</h3>
                    <Chart/>
                </section>

                <section id="section04">
                    <Modeling datas={datas}/>
                </section>
            </div>
        </div>
    </>
  );
}
