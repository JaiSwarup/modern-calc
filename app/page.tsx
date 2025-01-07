"use client";
import styles from './home.module.scss';
import { Workbook } from "@fortune-sheet/react";
import "@fortune-sheet/react/dist/index.css";
import Navbar from './components/Navbar';

export default function Home() {

  return (
    <>
    <Navbar />
    <main className={styles.main}>
      <header className={styles.header}>
        <h1>Welcome to Modern Calc</h1>
        <p>Your modern solution for spreadsheet management.</p>
        <p>Invite your team members to collaborate on your spreadsheets in real-time.</p>
      </header>
      <section className={styles.getStarted}>
        <h2>Get Started</h2>
        <p>To start using Modern Calc, create a new account and start adding workbooks.</p>
        <div className={styles.workbookContainer}>
          <Workbook
            data={[{
              name: "Sheet1",
              celldata:[{r: 0, c: 0, v: {ct
                : 
                {fa: 'General', t: 'g'},
                m
                : 
                "value",
                v
                : 
                "value"}}],
                color: "",
                column: 18, 
                config: {}, defaultColWidth: 73,
                defaultRowHeight: 19,
                id: "677c375c2754a1c4a1ac2481",
                isPivotTable: false,
                // luckysheet_alternateformat_save: [{}],
                // luckysheet_conditionformat_save: [{}],
                order: 0,
                row: 36,
                showGridLines: 1,
                status: 1,
                zoomRatio: 1
          }]}
            // showFormulaBar={false}
            showToolbar={false}
            showSheetTabs={false}
            // onChange={onChange}
            // onOp={onOp}
            />
        </div>
      </section>
    </main>
    </>
  );
};
