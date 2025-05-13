import { ValidationError } from '@/types';
import { notification } from 'antd';
import dayjs from 'dayjs';

// export * from "./validation.atd.form"

// import {Address , ValidationErrors} from "@type/master"

export function truncateText(text: string, wordLimit: number) {
  const words = text.split(' ');
  if (words.length <= wordLimit) {
    return text;
  }
  return words.slice(0, wordLimit).join(' ') + '...';
}

export function handleError(error: unknown) {
  // Kiểm tra nếu lỗi có thuộc tính details
  const validationError = error as ValidationError;
  //   console.log(validationError.details[0].msg)
  if (validationError.details) {
    notification.error({
      message: validationError.message,
      placement: 'bottomRight',
    });
    validationError.details.forEach((detail) => {
      notification.error({
        message: `Error in ${detail.path}: ${detail.msg}`,
        placement: 'bottomRight',
      });
    });
  } else {
    notification.error({
      message: validationError.message || 'An unexpected error occurred',
      placement: 'bottomRight',
    });
  }
}

// Helper function to parse JSON safely
export function parseJSON(data: string | null) {
  try {
    return data ? JSON.parse(data) : null;
  } catch (e) {
    console.error('Error parsing JSON:', e);
    return null;
  }
}

export function formatNumber(value: any) {
  if (value === undefined || value === null) return '';
  return new Intl.NumberFormat('vi-VN').format(value);
}

export function formatToNumber(value: any): number {
  if (typeof value !== 'number' || isNaN(value) || null) {
    return 0;
  }
  return Math.round(value);
}

export function formatCurrency(value: any) {
  return value?.replace(/\./g, '');
}
// export function stringityAddress(value : Address){
//     return `${value.address} , ${value.ward?.name} , ${value.district?.name} , ${value.province?.name}`
// }

export function setCookie(name: string, value: string, days: number) {
  const d = new Date();
  d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = 'expires=' + d.toUTCString();
  document.cookie = `${name}=${value}; ${expires}; path=/`;
}

export function getCookie(cookies: string, name: string) {
  const match = cookies.match(new RegExp(`(^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[2]) : null;
}

export function getUserCookie() {
  const cookie = document.cookie;
  const data = getCookie(cookie, 'user');

  if (data) {
    try {
      return JSON.parse(data);
    } catch (error) {
      console.error('Error parsing user cookie:', error);
      return null;
    }
  }

  return null; // Trả về null nếu cookie không có
}

export function deleteCookie(name: string) {
  // Set the cookie with a past expiration date
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
}

export function formatDate(date: Date): string {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');

  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();

  return `${hours}:${minutes} ${day}/${month}/${year}`;
}

export const classNames = (
  ...classes: (string | boolean | undefined)[]
): string => {
  return classes.filter(Boolean).join(' ');
};

export const truncate = (
  str: string | undefined,
  len: number
): string | null =>
  str?.length
    ? str.length <= len
      ? `${str.slice(0, len)}`
      : `${str.slice(0, len)}...`
    : null;

export const formatNumWithCommas = (num: number | string): string => {
  return num !== ''
    ? num?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    : '';
};

export const formatIndexToDouble = (num: number | string): string => {
  return num.toString().length === 1 ? `0${num}` : num.toString();
};

export function formatTime(seconds: number): string {
  if (seconds < 0) {
    return 'Invalid time';
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  let timeString = '';
  if (hours > 0) {
    timeString += hours + ' hrs ';
  }
  if (minutes > 0) {
    timeString += minutes + ' mins ';
  }
  if (remainingSeconds > 0) {
    timeString += remainingSeconds + ' secs';
  }

  return timeString.trim();
}

export const formatDuration = (seconds: number): string => {
  if (isNaN(seconds) || seconds < 0) {
    return 'Invalid input';
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes.toString();
  const formattedSeconds =
    remainingSeconds < 10
      ? `0${remainingSeconds}`
      : remainingSeconds.toString();

  return `${formattedMinutes}:${formattedSeconds}`;
};

export function formatDateString(date: string | Date): string {
  return dayjs(date).format('DD-MM-YYYY');
}

export function formatNumberWithCommas(number: number): string {
  if (typeof number !== 'number') {
    throw new Error('Input must be a number');
  }

  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export const floatToTime = (floatTime: number): string => {
  const num = floatTime.toFixed(2);
  if (typeof floatTime === 'number' && !isNaN(floatTime)) {
    const [minutes, seconds] = num.toString().split('.');
    return `${minutes}:${seconds?.slice(0, 2) || '00'}`;
  } else {
    return '0:00';
  }
};

const isNumber = (value: any): boolean => {
  return typeof value === 'number' && !isNaN(value);
};

const generateRandomNumbers = (
  count: number,
  min: number,
  max: number
): number[] => {
  if (isNumber(count) && isNumber(min) && isNumber(max)) {
    const numbers = Array.from(
      { length: max - min + 1 },
      (_, index) => index + min
    );

    for (let i = numbers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
    }
    return numbers.slice(0, count);
  }

  return [];
};

export const getRandomList = <T>(
  arr: T[],
  count: number,
  min: number,
  max: number
): T[] => {
  const randomNums = generateRandomNumbers(count, min, max);

  return arr?.length
    ? arr.filter((_, index) => randomNums.includes(index + 1))
    : [];
};

interface FormatDataItem {
  id?: string;
  picture_big?: string;
  cover_big?: string;
  album?: {
    cover_big?: string;
    id?: string;
    title?: string;
  };
  title?: string;
  name?: string;
  artist?: {
    name?: string;
    id?: string;
  };
  description?: string;
  details?: {
    description?: string;
    nb_album?: number;
    nb_fan?: number;
  };
  genres?: string[];
  type?: string;
  duration?: number;
  release_date?: string;
  creation_date?: string;
  contributors?: string[];
  track_total?: number;
  nb_tracks?: number;
  nb_album?: number;
  nb_fan?: number;
  fans?: number;
  preview?: string;
  tracks?: string[];
}

export const getFormatData = (arr: FormatDataItem[], image_alt: string) => {
  return arr?.length
    ? arr.map((item, index) => {
        return {
          index: index,
          id: item?.id,
          image:
            item?.picture_big ||
            item?.cover_big ||
            item?.album?.cover_big ||
            image_alt,
          name: item?.title || item?.name,
          desc:
            item?.artist?.name ||
            item?.description ||
            item?.details?.description,

          albumId: item?.album?.id,
          albumTitle: item?.album?.title,
          artistId: item?.artist?.id,
          artistName: item?.artist?.name,
          genres: item?.genres,
          type: item?.type,
          duration: item?.duration,
          releaseDate: item?.release_date || item?.creation_date,
          contributors: item?.contributors,
          tracksNo: item?.track_total || item?.nb_tracks,
          albumsNo: item?.nb_album || item?.details?.nb_album,
          fansNo: item?.nb_fan || item?.fans || item?.details?.nb_fan,
          audioSrc: item?.preview,
          tracks: item?.tracks,
          details: item?.details,
        };
      })
    : [];
};

export const pluralize = (word: string, count: number): string => {
  const wordsList: { [key: string]: string } = {
    track: 'tracks',
    album: 'albums',
    fan: 'fans',
  };

  return count > 1 ? wordsList[word] : word;
};

export const fileBlob = (files: FileList | null) => {
  if (files?.[0]) {
    return {
      blobName: files[0].name,
      blobUrl: URL.createObjectURL(files[0]),
    };
  } else {
    return {};
  }
};

export const getTimeOfDay = (): string => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) {
    return 'Good Morning';
  } else if (hour >= 12 && hour < 18) {
    return 'Good Afternoon';
  } else {
    return 'Good Evening';
  }
};
