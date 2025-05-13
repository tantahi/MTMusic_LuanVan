import React from 'react';

interface Track {
  id: number;
  title: string;
  artist: string;
  imageUrl: string;
  duration: string;
  artistUrl: string;
}

interface TrackSectionProps {
  title: string;
  tracks: Track[];
}

const TrackSection: React.FC<TrackSectionProps> = ({ title, tracks }) => {
  return (
    <div className="track_section">
      <div className="mb-4 flex flex-col gap-3">
        <div className="flex justify-between">
          <h2 className="text-xl font-semibold text-onNeutralBg">{title}</h2>
          <button className="border-main hover:bg-sidebar flex items-center justify-between gap-1 rounded-full border p-2 text-sm text-secondary hover:border-secondary hover:text-onNeutralBg">
            See more
            <svg
              stroke="currentColor"
              fill="currentColor"
              strokeWidth="0"
              viewBox="0 0 24 24"
              className="text-onNeutralBg text-secondary"
              height="20"
              width="20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M10.296 7.71 14.621 12l-4.325 4.29 1.408 1.42L17.461 12l-5.757-5.71z"></path>
              <path d="M6.704 6.29 5.296 7.71 9.621 12l-4.325 4.29 1.408 1.42L12.461 12z"></path>
            </svg>
          </button>
        </div>
      </div>
      <div className="list_content bg-sidebar rounded px-1 py-1">
        <ul className="flex w-full list-none flex-col">
          {tracks.map((track, index) => (
            <li
              key={track.id}
              className="hover:bg-card-hover border-divider focus-within:bg-divider group relative flex cursor-pointer items-center p-3 py-3 text-base !text-onNeutralBg focus-within:rounded hover:rounded"
            >
              <div className="items-between group relative flex w-full justify-center">
                <div className="xs:gap-4 flex flex-1 items-center justify-start gap-2">
                  <span className="xs:mr-2 mr-0 block text-sm">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div className="relative h-12 w-12">
                    <div className="group-hover:bg-main absolute h-full w-full bg-transparent group-hover:opacity-70"></div>
                    <img
                      src={track.imageUrl}
                      alt={track.title}
                      className="aspect-square h-full w-full rounded"
                    />
                    <div className="absolute top-0 flex h-full w-full items-center justify-center">
                      <button
                        type="button"
                        className="flex hidden h-10 h-7 w-10 w-7 items-center justify-center rounded-full rounded-full bg-primary text-white outline-none transition-all duration-300 ease-linear hover:scale-[1.1] disabled:cursor-not-allowed disabled:opacity-50 group-hover:flex"
                      >
                        <svg
                          stroke="currentColor"
                          fill="currentColor"
                          strokeWidth="0"
                          viewBox="0 0 16 16"
                          className="text-onNeutralBg text-white"
                          height="20"
                          width="20"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="flex w-full flex-1 flex-col gap-1 text-onNeutralBg">
                    <span className="text-sm">{track.title}</span>
                    <div className="xs:flex-row flex flex-col">
                      <a
                        title={track.artist}
                        className="cursor-pointer text-[14px] text-secondary underline-offset-4 hover:underline"
                        href={track.artistUrl}
                      >
                        {track.artist}
                      </a>
                    </div>
                  </div>
                </div>
                <div className="absolute right-0 flex items-center gap-2">
                  <div className="flex items-end justify-end text-right text-sm">
                    {track.duration}
                  </div>
                  <div className="flex items-center justify-end gap-2 text-right text-sm">
                    <div className="relative">
                      <div>
                        <button
                          className="w-full text-left"
                          id={`headlessui-menu-button-${track.id}`}
                          type="button"
                          aria-haspopup="menu"
                          aria-expanded="false"
                        >
                          <div className="relative">
                            <div className="hover:bg-sidebar flex h-8 w-8 items-center justify-center rounded">
                              <svg
                                stroke="currentColor"
                                fill="none"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="text-onNeutralBg text-onNeutralBg"
                                height="26"
                                width="26"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  stroke="none"
                                  d="M0 0h24v24H0z"
                                  fill="none"
                                ></path>
                                <path d="M19 8h-14"></path>
                                <path d="M5 12h9"></path>
                                <path d="M11 16h-6"></path>
                                <path d="M15 16h6"></path>
                                <path d="M18 13v6"></path>
                              </svg>
                            </div>
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default TrackSection;
