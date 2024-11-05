'use client'

import {Swiper, SwiperSlide} from "swiper/react";
import Image from "next/image";
import 'swiper/css';
import 'swiper/css/navigation';
import { Navigation } from 'swiper/modules';

export default function ImageSlider() {
    return(
        <Swiper navigation={true} modules={[Navigation]} slidesPerView={2} centeredSlides={true}>
            <SwiperSlide>
                <Image src="/images/@temp/sample-01.png" alt="가납교" width={641} height={415} />
            </SwiperSlide>
            <SwiperSlide>
                <Image src="/images/@temp/sample-02.png" alt="가납교" width={641} height={415} />
            </SwiperSlide>
            <SwiperSlide>
                <Image src="/images/@temp/sample-03.png" alt="가납교" width={641} height={415} />
            </SwiperSlide>
        </Swiper>
    )
}
