// pages/BlogsPage.js
import React, { useState } from 'react';
// import { Link } from 'react-router-dom';

type BlogPost = {
    id: number;
    title: string;
    excerpt: string;
    category: string;
    author: string;
    date: string;
    image: string;
  };

function BlogsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('new');
  
  
  // Sample blog data
  const blogPosts = [
    {
      id: 1,
      title: "Care of your Teeth",
      excerpt: "Lorem ipsum dolor sit amet consectetur.",
      category: "Self Care",
      author: "Dentist",
      date: "2025-02-15",
      image: "/images/blog1.jpg"
    },
    {
      id: 2,
      title: "Care of your Teeth",
      excerpt: "Lorem ipsum dolor sit amet consectetur.",
      category: "Self Care",
      author: "Dentist",
      date: "2025-02-10",
      image: "/images/blog2.jpg"
    },
    {
      id: 3,
      title: "Care of your Teeth",
      excerpt: "Lorem ipsum dolor sit amet consectetur.",
      category: "Self Care",
      author: "Dentist",
      date: "2025-02-05",
      image: "/images/blog3.jpg"
    },
    {
      id: 4,
      title: "Care of your Teeth",
      excerpt: "Lorem ipsum dolor sit amet consectetur.",
      category: "Self Care",
      author: "Dentist",
      date: "2025-01-30",
      image: "/images/blog4.jpg"
    },
    {
      id: 5,
      title: "Care of your Teeth",
      excerpt: "Lorem ipsum dolor sit amet consectetur.",
      category: "Health care",
      author: "Dentist",
      date: "2025-01-25",
      image: "/images/blog5.jpg"
    },
    {
      id: 6,
      title: "Care of your Teeth",
      excerpt: "Lorem ipsum dolor sit amet consectetur.",
      category: "Self Care",
      author: "Dentist",
      date: "2025-01-20",
      image: "/images/blog6.jpg"
    },
    {
      id: 7,
      title: "Care of your Teeth",
      excerpt: "Lorem ipsum dolor sit amet consectetur.",
      category: "Self Care",
      author: "Dentist",
      date: "2025-01-15",
      image: "/images/blog7.jpg"
    },
    {
      id: 8,
      title: "Care of your Teeth",
      excerpt: "Lorem ipsum dolor sit amet consectetur.",
      category: "Health care",
      author: "Dentist",
      date: "2025-01-10",
      image: "/images/blog8.jpg"
    }
  ];

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredBlogs = blogPosts.filter(post => 
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    post.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedBlogs = [...filteredBlogs].sort((a: BlogPost, b: BlogPost) => {
    if (sortBy === 'new') {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    } else {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    }
  });

  return (
    <div className="blogs-page">
      <section className="page-hero">
        <div className="container">
          <h1>Blogs</h1>
          <p>
            We use only the best quality materials on the market in order to
            provide the best products to our patients
          </p>
          
          <div className="search-container">
            <input 
              type="text" 
              placeholder="Search" 
              value={searchTerm}
              onChange={handleSearch}
              className="search-input"
            />
            <i className="fas fa-search search-icon"></i>
          </div>
        </div>
      </section>

      <section className="featured-blogs">
        <div className="container">
          <div className="blog-grid">
            {sortedBlogs.slice(0, 4).map(post => (
              <div key={post.id} className="blog-card">
                <div className="blog-image">
                  <img src={post.image} alt={post.title} />
                </div>
                <div className="blog-category">
                  <span>{post.category}</span>
                  <span>- {post.author}</span>
                </div>
                <h3>{post.title}</h3>
                <p>{post.excerpt}</p>
              </div>
            ))}
          </div>
          
          <div className="pagination">
            <button className="active">1</button>
            <button>2</button>
          </div>
        </div>
      </section>

      <section className="all-articles">
        <div className="container">
          <div className="section-header">
            <h2>Articles</h2>
            <div className="sort-by">
              <span>Sort by: </span>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="new">New</option>
                <option value="old">Old</option>
              </select>
            </div>
          </div>
          
          <div className="articles-grid">
            {sortedBlogs.map(post => (
              <div key={post.id} className="article-card">
                <div className="article-image">
                  <img src={post.image} alt={post.title} />
                </div>
                <div className="article-category">
                  <span>{post.category}</span>
                </div>
                <h3>{post.title}</h3>
                <p>{post.excerpt}</p>
              </div>
            ))}
          </div>
          
          <div className="load-more">
            <button className="btn">Check out more</button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default BlogsPage;