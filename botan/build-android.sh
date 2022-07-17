#!/usr/bin/env bash
set -e

SDK_VERSION=21
BOTAN_PATH=./botan
BOTAN_VERSION=2.19.2

if [ ! -d "$BOTAN_PATH" ]; then
  echo "Cloning botan@$BOTAN_VERSION into $BOTAN_PATH"
  git clone --quiet --depth 1 --branch "$BOTAN_VERSION" https://github.com/randombit/botan/
fi

DETECTED_VERSION=$(./botan/configure.py --version)
if [ "$DETECTED_VERSION" != "$BOTAN_VERSION" ]; then
  echo "Botan version mismatch between $DETECTED_VERSION (found) and $BOTAN_VERSION (expected)"
  exit 1
fi

function build() {
  local version="$BOTAN_VERSION"
  local android_sdk_ver="$SDK_VERSION"

  local android_name="$1"
  local android_arch="$2"
  local android_toolchain_suf="$3"
  local android_arch_suf="$4"

  echo "Building botan $version for $android_arch $android_toolchain_suf ($android_name)"
  mkdir -p docker-builds

  docker build -f Dockerfile.android --force-rm -t "botan-android-${version}" \
      --build-arg "ANDROID_NAME=${android_name}" \
      --build-arg "ANDROID_ARCH=${android_arch}" \
      --build-arg "ANDROID_ARCH_SUF=${android_arch_suf}" \
      --build-arg "ANDROID_SDK_VER=${android_sdk_ver}" \
      --build-arg "ANDROID_TOOLCHAIN_SUF=${android_toolchain_suf}" \
      .
  docker create --name "botan-android-${version}" "botan-android-${version}"
  docker cp "botan-android-${version}":/home/circleci/project/botan/android docker-builds
  docker rm -f "botan-android-${version}"
}

if [ ! -d "./docker-builds/android/armeabi-v7a" ]; then
  build armeabi-v7a armv7a eabi
fi

if [ ! -d "./docker-builds/android/arm64-v8a" ]; then
  build arm64-v8a aarch64
fi

if [ ! -d "./docker-builds/android/x86_64" ]; then
  build x86_64 x86_64
fi

if [ ! -d "./docker-builds/android/x86" ]; then
  build x86 i686
fi
