import React from 'react';

interface BannerMediaProps {
  playlistName: string;
  description: string;
  author: string;
  date: string;
}

const BannerMedia: React.FC<BannerMediaProps> = ({
  playlistName,
  description,
  author,
  date,
}) => {
  return (
    <div className="banner_section relative">
      <div className="xs:flex-row relative z-10 flex min-h-[250px] flex-col items-center gap-6 rounded bg-primary-opacity p-4">
        {/* Background Gradient */}
        <div className="absolute left-0 right-0 top-0 h-full w-full overflow-hidden rounded bg-transparent">
          <div className="from-card absolute right-[-15px] top-[-125px] z-20 h-[210px] w-[210px] rounded-full bg-gradient-to-l to-primary opacity-20"></div>
          <div className="from-card absolute right-[-95px] top-[-85px] z-20 h-[210px] w-[210px] rounded-full bg-gradient-to-l to-primary opacity-30"></div>
        </div>

        {/* Play Button */}
        <button className="shadow_card flex_justify_center bg-main z-50 aspect-square h-[180px] w-[180px] rounded">
          <svg
            stroke="currentColor"
            fill="currentColor"
            strokeWidth="0"
            viewBox="0 0 16 16"
            className="!text-secondary text-onNeutralBg"
            height="60"
            width="60"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M6 13c0 1.105-1.12 2-2.5 2S1 14.105 1 13c0-1.104 1.12-2 2.5-2s2.5.896 2.5 2zm9-2c0 1.105-1.12 2-2.5 2s-2.5-.895-2.5-2 1.12-2 2.5-2 2.5.895 2.5 2z"></path>
            <path fillRule="evenodd" d="M14 11V2h1v9h-1zM6 3v10H5V3h1z"></path>
            <path d="M5 2.905a1 1 0 0 1 .9-.995l8-.8a1 1 0 0 1 1.1.995V3L5 4V2.905z"></path>
          </svg>
        </button>

        {/* Playlist Information */}
        <div className="z-50 flex w-full flex-col items-start justify-between text-onNeutralBg">
          <div className="gap-2">
            <div className="flex items-center">
              <div className="block capitalize">playlist</div>
            </div>
            <button className="text-left">
              <div className="mb-4 flex flex-col gap-3">
                <div className="flex_justify_between">
                  <h2 className="text-3xl font-semibold text-onNeutralBg">
                    {playlistName}
                  </h2>
                </div>
                <p className="-mt-2 text-sm font-normal tracking-wider text-secondary">
                  {description}
                </p>
              </div>
            </button>
            <div className="flex items-center gap-3">
              <div className="-mt-2 mb-4 flex flex-wrap items-center text-sm tracking-wider text-secondary">
                <span>{author} &nbsp;.&nbsp;&nbsp;</span>
                <span>{date}</span>
              </div>
            </div>
          </div>

          {/* Menu Button */}
          <div className="flex gap-4">
            <div className="relative" data-headlessui-state="">
              <div>
                <button
                  className="w-full text-left"
                  id="headlessui-menu-button"
                  type="button"
                  aria-haspopup="menu"
                  aria-expanded="false"
                  aria-controls="headlessui-menu-items"
                >
                  <div className="hover:bg-sidebar flex h-10 w-10 scale-[1] items-center justify-center rounded-full duration-300 ease-linear hover:scale-[1.05]">
                    <svg
                      stroke="currentColor"
                      fill="none"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                      className="text-onNeutralBg text-onNeutralBg"
                      height="20"
                      width="20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"
                      ></path>
                    </svg>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BannerMedia;
