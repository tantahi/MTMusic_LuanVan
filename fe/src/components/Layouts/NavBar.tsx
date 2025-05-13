'use client';
import React, { useState, ReactNode } from 'react';

export default function NavBar() {
  return (
    <>
      <nav className="h-navbar sidebar_horizontal_width fixed top-0 z-[1200] bg-neutralBgOpacity backdrop-blur-[50px]">
        <div className="absolute h-full w-full transition-all duration-300"></div>

        <div className="relative flex h-full items-center justify-between">
          <div className="h-navbar lg:bg-sidebar relative z-20 p-3 duration-500">
            <a href="/" className="logo flex h-full w-fit items-center gap-2">
              <div className="absolute left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%]">
                <span className="text-primary">Icon</span>
              </div>
              <h1 className="text-[20px] font-bold text-primary opacity-100 transition-opacity duration-1000">
                LogoName
              </h1>
            </a>
          </div>

          <div className="flex items-center gap-4 px-3 lg:flex-1">
            <div className="z-20 flex h-full flex-1 items-center gap-4">
              <div className="hidden h-full items-center lg:flex">
                <button className="flex_justify_center group h-12 w-12 rounded bg-primary-opacity transition-colors duration-500 hover:bg-primary">
                  <span className="group-hover:!text-white">Icon</span>
                </button>
              </div>

              <div className="h-full w-full">
                <div className="flex_justify_between border-divider bg-main h-full w-full rounded border px-3 duration-500 hover:border-onNeutralBg">
                  <span>Icon</span>
                  <input
                    placeholder="Search songs, albums ..."
                    className="focus:bg-card h-12 w-full flex-1 rounded border-onNeutralBg bg-transparent px-4 text-sm text-onNeutralBg outline-0"
                  />
                  <button className="flex_justify_center bg-sidebar hover:bg-red-500 h-8 w-8 rounded transition-colors duration-500">
                    <span>Icon</span>
                  </button>
                </div>
              </div>

              <div className="flex h-full items-center lg:hidden">
                <button className="flex_justify_center group h-12 w-12 rounded bg-primary-opacity transition-colors duration-500 hover:bg-primary">
                  <span className="group-hover:!text-white">Icon</span>
                </button>
              </div>
            </div>

            <div className="nav-icons flex h-full items-center gap-4">
              <div className="flex h-full items-center">
                <div className="group relative">
                  <div className="absolute right-2 top-2 flex h-4 w-4 animate-bounce items-center justify-center rounded-full bg-primary group-hover:bg-white">
                    <span className="text-xs text-white group-hover:text-primary">
                      3
                    </span>
                  </div>
                  <div className="flex_justify_center h-12 w-12 rounded bg-primary-opacity transition-colors duration-500 group-hover:bg-primary">
                    <span className="group-hover:!text-white">Icon</span>
                  </div>
                </div>
              </div>

              <div className="flex h-full items-center">
                <div className="flex_justify_center group h-full gap-2 rounded-full bg-primary-opacity p-2 transition-colors duration-500 hover:bg-primary">
                  <div className="flex_justify_center bg-main h-9 w-9 rounded-full">
                    <span>Icon</span>
                  </div>
                  <span className="pr-2">
                    <span className="group-hover:!text-white">Icon</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-0 px-4">
              <button className="!border-onNeutralBg !text-onNeutralBg">
                Sign Up
              </button>
              <button className="contained">Log In</button>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
