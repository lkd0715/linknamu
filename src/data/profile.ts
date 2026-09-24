export type LinkItem = {
  id: string;
  title: string;
  url: string;
  description?: string;
};

export type Profile = {
  name: string;
  bio: string;
  image: string;
  links: LinkItem[];
};

// 내 프로필과 링크 목록. id는 클릭 수 집계 키로 쓰이므로 한 번 정하면 바꾸지 않는다.
// TODO: 보여주기용 더미값. 실제 이름·소개·사진·링크로 교체할 것.
export const profile: Profile = {
  name: "홍길동",
  bio: "웹 개발자 · 오늘도 무언가를 만들고 있어요",
  image: "/profile.svg",
  links: [
    {
      id: "github",
      title: "GitHub",
      url: "https://github.com/",
      description: "코드와 사이드 프로젝트",
    },
    {
      id: "linkedin",
      title: "LinkedIn",
      url: "https://www.linkedin.com/",
      description: "경력과 이력",
    },
    {
      id: "blog",
      title: "블로그",
      url: "https://velog.io/",
      description: "개발 기록과 회고",
    },
  ],
};
